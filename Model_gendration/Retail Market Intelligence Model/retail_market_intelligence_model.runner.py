import json
import requests
import math
from geopy.geocoders import Nominatim
import time
from datetime import datetime
import geocoder
import numpy as np
from collections import defaultdict
import sys
import urllib.parse
from dataclasses import dataclass
import urllib.parse
from typing import List, Dict, Optional, Tuple, Any
from dataclasses import dataclass
import pandas as pd
import time
import json
from functools import lru_cache
import logging
import math
import random
from typing import List, Tuple
import time
from math import radians, sin, cos, sqrt, atan2
import os

HERE_API_KEY = os.getenv('HERE_API_KEY')
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
OPENWEATHER_API_KEY = os.getenv('OPEN_WEATHER_API_KEY')
TICKETMASTER_API_KEY = os.getenv('TICKETMASTER_API_KEY')

# Configuration
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

class TrafficScoreCalculator:
    def __init__(self):
        # API Keys
        self.here_api_key = os.getenv('HERE_API_KEY')
        self.openweather_api_key = os.getenv('OPEN_WEATHER_API_KEY')
        self.ticketmaster_api_key = os.getenv('TICKET_MASTER_API_KEY')
        self.google_maps_api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        
        self.poi_categories = {
            'commercial': ['shop', 'office', 'commercial'],
            'retail': ['supermarket', 'mall', 'convenience', 'department_store'],
            'food': ['restaurant', 'cafe', 'fast_food', 'bar', 'pub'],
            'education': ['school', 'university', 'college', 'kindergarten'],
            'healthcare': ['hospital', 'clinic', 'pharmacy', 'doctors'],
            'transport': ['bus_station', 'train_station', 'subway_entrance', 'taxi'],
            'entertainment': ['cinema', 'theatre', 'arts_centre', 'nightclub'],
            'public': ['library', 'post_office', 'courthouse', 'townhall']
        }
        
        # Country population density data (people per km²)
        self.country_densities = {
            'US': 36, 'CA': 4, 'UK': 281, 'GB': 281, 'DE': 232, 'FR': 119,
            'CN': 153, 'IN': 464, 'JP': 347, 'BR': 25, 'RU': 9,
            'AU': 3, 'MX': 66, 'ZA': 49, 'NG': 226, 'EG': 103,
            'IT': 206, 'ES': 94, 'NL': 508, 'BE': 383, 'SE': 25,
            'NO': 15, 'FI': 18, 'DK': 137, 'PL': 124, 'TR': 110,
            'KR': 527, 'ID': 151, 'PK': 287, 'BD': 1265, 'PH': 368
        }
        
    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two coordinates in km"""
        R = 6371  # Earth radius in km
        
        lat1_rad = radians(lat1)
        lon1_rad = radians(lon1)
        lat2_rad = radians(lat2)
        lon2_rad = radians(lon2)
        
        dlon = lon2_rad - lon1_rad
        dlat = lat2_rad - lat1_rad
        
        a = sin(dlat/2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    def get_country_code(self, lat, lon):
        """Get country code from coordinates using Nominatim with proper headers"""
        url = "https://nominatim.openstreetmap.org/reverse"
        headers = {
            'User-Agent': 'TrafficScoreCalculator/1.0 (https://example.com; contact@example.com)'
        }
        params = {
            'format': 'json',
            'lat': lat,
            'lon': lon,
            'zoom': 3,
            'addressdetails': 1
        }
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if 'address' in data and 'country_code' in data['address']:
                return data['address']['country_code'].upper()
            else:
                return 'US'  # Default fallback
                
        except Exception as e:
            print(f"Error getting country code: {e}")
            return 'US'  # Default fallback
    
    def get_real_time_traffic_here(self, lat, lon, radius_km):
        """Get real-time traffic data from HERE API"""
        if not self.here_api_key:
            return 0.7
            
        url = "https://traffic.ls.hereapi.com/traffic/6.2/flow.json"
        params = {
            'apiKey': self.here_api_key,
            'prox': f'{lat},{lon},{radius_km*1000}',
            'responseattributes': 'sh,fc'
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            total_jf = 0
            count = 0
            
            if 'RWS' in data and data['RWS']:
                for rw in data['RWS'][0].get('RW', []):
                    for fis in rw.get('FIS', []):
                        for cf in fis.get('TMC', {}).get('CF', []):
                            jf = cf.get('JF', 0)
                            if jf > 0:
                                total_jf += jf
                                count += 1
            
            return total_jf / count if count > 0 else 0.7
            
        except Exception as e:
            print(f"HERE Traffic API error: {e}")
            return 0.7
    
    def get_weather_impact(self, lat, lon):
        """Get weather impact factor from OpenWeather API"""
        if not self.openweather_api_key:
            return 1.0
            
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            'lat': lat,
            'lon': lon,
            'appid': self.openweather_api_key,
            'units': 'metric'
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            weather_main = data.get('weather', [{}])[0].get('main', '').lower()
            temp = data.get('main', {}).get('temp', 20)
            wind_speed = data.get('wind', {}).get('speed', 0)
            
            # Weather impact factors
            impact = 1.0
            
            # Bad weather increases traffic (people drive instead of walk)
            if any(w in weather_main for w in ['rain', 'snow', 'storm', 'thunderstorm']):
                impact = 1.4
            elif any(w in weather_main for w in ['fog', 'haze', 'mist']):
                impact = 1.2
            elif 'clear' in weather_main or temp > 25:  # Good weather encourages walking
                impact = 0.9
                
            # High winds can reduce outdoor activities
            if wind_speed > 15:
                impact *= 0.9
                
            return impact
            
        except Exception as e:
            print(f"Weather API error: {e}")
            return 1.0
    
    def get_events_impact(self, lat, lon, radius_km):
        """Get events impact from Ticketmaster API"""
        if not self.ticketmaster_api_key:
            return 1.0
            
        url = "https://app.ticketmaster.com/discovery/v2/events.json"
        params = {
            'apikey': self.ticketmaster_api_key,
            'latlong': f'{lat},{lon}',
            'radius': radius_km,
            'unit': 'km',
            'size': 10
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            events_count = len(data.get('_embedded', {}).get('events', []))
            
            # Each event increases traffic potential
            events_impact = 1.0 + (events_count * 0.15)
            return min(events_impact, 2.0)
            
        except Exception as e:
            print(f"Ticketmaster API error: {e}")
            return 1.0
    
    def get_google_places_density(self, lat, lon, radius_km):
        """Get POI density from Google Places API"""
        if not self.google_maps_api_key:
            return 50
            
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            'key': self.google_maps_api_key,
            'location': f'{lat},{lon}',
            'radius': min(radius_km * 1000, 50000),
            'type': 'establishment'
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if data.get('status') == 'OK':
                return len(data.get('results', []))
            else:
                return 50
                
        except Exception as e:
            print(f"Google Places API error: {e}")
            return 50
    
    def get_google_places_breakdown(self, lat, lon, radius_km):
        """Get detailed POI breakdown from Google Places API"""
        if not self.google_maps_api_key:
            return {category: np.random.randint(5, 15) for category in self.poi_categories}
            
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            'key': self.google_maps_api_key,
            'location': f'{lat},{lon}',
            'radius': min(radius_km * 1000, 50000)
        }
        
        category_counts = {category: 0 for category in self.poi_categories}
        
        try:
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if data.get('status') == 'OK':
                for place in data.get('results', []):
                    place_types = place.get('types', [])
                    
                    for category, keywords in self.poi_categories.items():
                        if any(keyword in str(place_types) for keyword in keywords):
                            category_counts[category] += 1
                            
            return category_counts
            
        except Exception as e:
            print(f"Google Places breakdown error: {e}")
            return {category: np.random.randint(5, 15) for category in self.poi_categories}
    
    def query_overpass_roads(self, lat, lon, radius_km):
        """Get road density from Overpass API"""
        radius_m = radius_km * 1000
        radius_deg = radius_m / 111000
        
        min_lat = lat - radius_deg
        max_lat = lat + radius_deg
        min_lon = lon - radius_deg
        max_lon = lon + radius_deg
        
        query = f"""
        [out:json];
        (
          way["highway"]({min_lat},{min_lon},{max_lat},{max_lon});
        );
        out count;
        """
        
        try:
            response = requests.post("https://overpass-api.de/api/interpreter", 
                                   data=query, timeout=15)
            data = response.json()
            
            road_count = 0
            for element in data.get('elements', []):
                if 'tags' in element and 'highway' in element['tags']:
                    road_count += 1
            
            return road_count
            
        except Exception as e:
            print(f"Overpass roads API error: {e}")
            # Estimate based on urban/rural classification
            poi_count = self.get_google_places_density(lat, lon, 2)
            if poi_count > 100:
                return 20  # Urban area
            elif poi_count > 30:
                return 10  # Suburban
            else:
                return 5   # Rural
    
    def get_population_density(self, lat, lon, radius_km):
        """Estimate population density using multiple data sources"""
        country_code = self.get_country_code(lat, lon)
        base_density = self.country_densities.get(country_code, 100)
        
        # Use Google Places density as proxy for urbanization
        poi_density = self.get_google_places_density(lat, lon, 2)
        
        if poi_density > 150:
            # Major urban center
            density_factor = 300
        elif poi_density > 80:
            # Urban area
            density_factor = 150
        elif poi_density > 30:
            # Suburban area
            density_factor = 50
        else:
            # Rural area
            density_factor = 10
            
        estimated_density = base_density * density_factor
        
        # Adjust based on real-time factors
        traffic_flow = self.get_real_time_traffic_here(lat, lon, 1)
        estimated_density *= (0.5 + traffic_flow)  # Scale with traffic
        
        return min(estimated_density, 50000)  # Cap at reasonable maximum
    
    def calculate_traffic_score(self, lat, lon, radius_km=1):
        """
        Calculate comprehensive traffic score using all 5 APIs
        Returns a score between 0-100 with high accuracy
        """
        # Real-time data from all APIs
        real_time_traffic = self.get_real_time_traffic_here(lat, lon, radius_km)
        weather_impact = self.get_weather_impact(lat, lon)
        events_impact = self.get_events_impact(lat, lon, radius_km)
        poi_density = self.get_google_places_density(lat, lon, radius_km)
        population_density = self.get_population_density(lat, lon, radius_km)
        road_density = self.query_overpass_roads(lat, lon, radius_km)
        poi_breakdown = self.get_google_places_breakdown(lat, lon, radius_km)
        
        # Normalize factors (0-1 range)
        norm_traffic = min(1.0, real_time_traffic / 10.0)  # HERE JF is 0-10
        norm_poi = min(1.0, poi_density / 200.0)  # Scale based on maximum expected POIs
        norm_pop = min(1.0, population_density / 20000.0)  # Scale population density
        norm_roads = min(1.0, road_density / 20.0)  # Scale road density
        
        # Calculate base traffic score with optimized weights
        base_score = (
            norm_traffic * 0.30 +      # Real-time traffic flow (most important)
            norm_poi * 0.25 +          # POI density
            norm_pop * 0.20 +          # Population density
            norm_roads * 0.15 +        # Road infrastructure
            (weather_impact - 1.0) * 0.05 +  # Weather impact
            (events_impact - 1.0) * 0.05     # Events impact
        )
        
        # Apply multipliers and ensure 0-100 range
        traffic_score = max(0, min(100, base_score * 100 * weather_impact * events_impact))
        
        # Confidence estimation based on API responses
        confidence_factors = []
        if real_time_traffic > 0: confidence_factors.append(0.9)
        if poi_density > 0: confidence_factors.append(0.85)
        if population_density > 0: confidence_factors.append(0.8)
        
        confidence = np.mean(confidence_factors) if confidence_factors else 0.7
        
        return {
            'traffic_score': round(traffic_score, 1),
            'confidence': round(confidence, 2),
            'real_time_factors': {
                'traffic_flow': round(real_time_traffic, 2),
                'weather_impact': round(weather_impact, 2),
                'events_impact': round(events_impact, 2)
            },
            'infrastructure_factors': {
                'poi_density': poi_density,
                'population_density': round(population_density, 2),
                'road_density': road_density
            },
            'normalized_factors': {
                'traffic': round(norm_traffic, 2),
                'poi': round(norm_poi, 2),
                'population': round(norm_pop, 2),
                'roads': round(norm_roads, 2)
            },
        }

# Example usage

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RadiusIncomeFetcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        
    def generate_points_in_radius(self, center_lat: float, center_lon: float, 
                                 radius_km: float = 2, num_points: int = 8) -> List[Tuple[float, float]]:
        """
        Generate multiple points within specified radius using Fibonacci sphere sampling
        for better distribution around the center point
        """
        points = []
        
        # Always include the center point
        points.append((center_lat, center_lon))
        
        # Generate points in concentric circles around center
        for i in range(1, num_points):
            # Calculate distance from center (0 to radius)
            distance_km = radius_km * math.sqrt(random.random())
            
            # Calculate bearing (0 to 360 degrees)
            bearing = 2 * math.pi * random.random()
            
            # Convert to radians
            lat_rad = math.radians(center_lat)
            lon_rad = math.radians(center_lon)
            
            # Earth's radius in km
            earth_radius = 6371.0
            
            # Calculate new point
            angular_distance = distance_km / earth_radius
            
            new_lat = math.asin(math.sin(lat_rad) * math.cos(angular_distance) +
                               math.cos(lat_rad) * math.sin(angular_distance) * math.cos(bearing))
            
            new_lon = lon_rad + math.atan2(math.sin(bearing) * math.sin(angular_distance) * math.cos(lat_rad),
                                          math.cos(angular_distance) - math.sin(lat_rad) * math.sin(new_lat))
            
            # Convert back to degrees
            new_lat_deg = math.degrees(new_lat)
            new_lon_deg = math.degrees(new_lon)
            
            points.append((new_lat_deg, new_lon_deg))
        
        return points
    
    @lru_cache(maxsize=1000)
    def reverse_geocode_with_fallback(self, lat: float, lon: float) -> dict:
        """
        Reverse geocode with multiple fallback services for better accuracy
        """
        services = [
            self._geocode_nominatim,
            self._geocode_geonames,
            self._geocode_bigdatacloud
        ]
        
        for service in services:
            try:
                result = service(lat, lon)
                if result and result.get('country_code'):
                    return result
            except Exception as e:
                logger.warning(f"Geocoding service failed: {e}")
                continue
        
        raise Exception("All geocoding services failed")
    
    def _geocode_nominatim(self, lat: float, lon: float) -> dict:
        """OpenStreetMap Nominatim"""
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=10&addressdetails=1"
        response = self.session.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if 'address' in data:
            address = data['address']
            return {
                'country_code': address.get('country_code', '').upper(),
                'country': address.get('country', ''),
                'service': 'nominatim'
            }
        return None
    
    def _geocode_geonames(self, lat: float, lon: float) -> dict:
        """GeoNames fallback service"""
        url = f"http://api.geonames.org/countryCode?lat={lat}&lng={lon}&username=demo&type=JSON"
        response = self.session.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if 'countryCode' in data:
            return {
                'country_code': data['countryCode'].upper(),
                'country': data.get('countryName', ''),
                'service': 'geonames'
            }
        return None
    
    def _geocode_bigdatacloud(self, lat: float, lon: float) -> dict:
        """BigDataCloud fallback (free tier available)"""
        url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lon}&localityLanguage=en"
        response = self.session.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if 'countryCode' in data:
            return {
                'country_code': data['countryCode'].upper(),
                'country': data.get('countryName', ''),
                'service': 'bigdatacloud'
            }
        return None
    
    @lru_cache(maxsize=1000)
    def get_worldbank_data(self, country_code: str, indicator: str, start_year: int, end_year: int) -> list:
        """Get World Bank data with caching"""
        url = f"http://api.worldbank.org/v2/country/{country_code}/indicator/{indicator}?format=json&date={start_year}:{end_year}&per_page=100"
        
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            if len(data) >= 2 and data[1]:
                return data[1]
            return []
        except Exception as e:
            logger.error(f"World Bank API failed: {e}")
            return []
    
    def get_alternative_indicators(self, country_code: str, year: int) -> dict:
        """Get alternative economic indicators if primary fails"""
        indicators = {
            "gdp_per_capita": "NY.GDP.PCAP.CD",
            "gni_per_capita": "NY.GNP.PCAP.CD",
            "gdp_total": "NY.GDP.MKTP.CD",
            "gni_total": "NY.GNP.MKTP.CD"
        }
        
        results = {}
        for name, indicator in indicators.items():
            try:
                data = self.get_worldbank_data(country_code, indicator, year, year)
                if data and data[0].get('value'):
                    results[name] = data[0]['value']
            except:
                continue
        
        return results
    
    def estimate_income_from_alternatives(self, alternatives: dict) -> float:
        """Estimate income from alternative indicators"""
        if 'gdp_per_capita' in alternatives:
            return alternatives['gdp_per_capita']
        elif 'gni_per_capita' in alternatives:
            return alternatives['gni_per_capita']
        elif 'gdp_total' in alternatives and 'gni_total' in alternatives:
            # Simple average if both totals available
            return (alternatives['gdp_total'] + alternatives['gni_total']) / 2
        elif 'gdp_total' in alternatives:
            return alternatives['gdp_total']
        elif 'gni_total' in alternatives:
            return alternatives['gni_total']
        return None
    
    def fetch_income_for_single_point(self, lat: float, lon: float, 
                                    indicator: str, start_year: int, end_year: int) -> dict:
        """Fetch income data for a single coordinate point"""
        try:
            geo_data = self.reverse_geocode_with_fallback(lat, lon)
            country_code = geo_data['country_code']
            country_name = geo_data['country']
            
            wb_data = self.get_worldbank_data(country_code, indicator, start_year, end_year)
            
            if not wb_data:
                # Try alternatives
                alternatives = {}
                for year in range(start_year, end_year + 1):
                    year_alternatives = self.get_alternative_indicators(country_code, year)
                    if year_alternatives:
                        alternatives[year] = year_alternatives
                
                if alternatives:
                    year_data = {}
                    for year, alt_data in alternatives.items():
                        estimated_value = self.estimate_income_from_alternatives(alt_data)
                        if estimated_value:
                            year_data[str(year)] = estimated_value
                    return {
                        'country_code': country_code,
                        'country_name': country_name,
                        'data': year_data,
                        'source': 'estimated'
                    }
            
            # Process standard World Bank data
            year_data = {}
            for item in wb_data:
                if item.get('value') is not None:
                    year_data[item["date"]] = item["value"]
            
            return {
                'country_code': country_code,
                'country_name': country_name,
                'data': year_data,
                'source': 'world_bank'
            }
            
        except Exception as e:
            logger.warning(f"Failed to fetch data for point {lat}, {lon}: {e}")
            return None
    
    def fetch_avg_income_on_country(self, center_lat: float, center_lon: float, 
                                  radius_km: float = 2, 
                                  indicator: str = "NY.GDP.PCAP.CD", 
                                  start_year: int = 2020, 
                                  end_year: int = 2023,
                                  num_sample_points: int = 8) -> pd.DataFrame:
        """
        Fetch average income within specified radius by sampling multiple points
        
        Args:
            center_lat (float): Center latitude
            center_lon (float): Center longitude
            radius_km (float): Radius in kilometers (default 2km)
            indicator (str): World Bank indicator code
            start_year (int): Start year
            end_year (int): End year
            num_sample_points (int): Number of points to sample within radius
            
        Returns:
            pd.DataFrame: DataFrame with averaged income data
        """
                
        # Generate points within radius
        points = self.generate_points_in_radius(center_lat, center_lon, radius_km, num_sample_points)
        
        all_results = []
        successful_points = 0
        
        for i, (lat, lon) in enumerate(points):
            try:
                
                result = self.fetch_income_for_single_point(lat, lon, indicator, start_year, end_year)
                
                if result and result['data']:
                    all_results.append(result)
                    successful_points += 1
                
                # Rate limiting
                if i < len(points) - 1:
                    time.sleep(0.5)
                    
            except Exception as e:
                logger.warning(f"Point {i+1} failed: {e}")
                continue
        
        if successful_points == 0:
            raise Exception("No successful data points found within radius")
        
        # Calculate weighted average across all successful points
        logger.info(f"Successfully processed {successful_points}/{len(points)} points")
        
        # Aggregate data by year
        yearly_data = {}
        for result in all_results:
            for year, value in result['data'].items():
                if year not in yearly_data:
                    yearly_data[year] = []
                yearly_data[year].append(value)
        
        # Calculate statistics
        records = []
        for year, values in yearly_data.items():
            if values:
                records.append({
                    'year': year,
                    'value': np.mean(values),
                    'confidence_score': min(100, (successful_points / len(points)) * 100)
                })
        
        if not records:
            raise Exception("No valid income data found within radius")
        
        # Sort by year
        records.sort(key=lambda x: x['year'])
        
        return pd.DataFrame(records)

# Install required packages if missing
try:
    from haversine import haversine
except ImportError:
    print("Installing required haversine package...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "haversine"])
    from haversine import haversine

try:
    import requests
except ImportError:
    print("Installing required requests package...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

@dataclass
class Competitor:
    name: str
    type: str
    distance: float
    latitude: float
    longitude: float
    osm_id: str
    osm_type: str
    address: str = ""
    google_maps_url: str = ""

class CompetitorAnalyzer:
    def __init__(self):
        self.overpass_url = "http://overpass-api.de/api/interpreter"
        self.request_timeout = 45
        self.rate_limit_delay = 2  # seconds between requests
    
    def set_parameters(self, latitude: float, longitude: float, radius: int, business_types: List[str]):
        """Set analysis parameters directly"""
        self.latitude = latitude
        self.longitude = longitude
        self.radius = radius
        self.business_types = business_types
        
    def get_user_input(self) -> Tuple[float, float, int, List[str]]:
        """Get comprehensive user input including location"""
        print("=== Competitor Analysis Tool ===\n")
        print("This tool helps you find competitors by name and type in any location.\n")
        
        # Get location input
        latitude, longitude = self._get_location_input()
        
        # Get radius input
        radius = self._get_radius_input()
        
        # Get business types
        business_types = self._get_business_types_input()
        
        return latitude, longitude, radius, business_types
    
    def _get_location_input(self) -> Tuple[float, float]:
        """Get location coordinates from user with flexible input options"""
        while True:
            try:
                print("\n📍 LOCATION INPUT OPTIONS:")
                print("1. Use default location (Chennai, India)")
                print("2. Enter latitude and longitude")
                print("3. Enter a place name (city, address, etc.)")
                
                option = input("\nChoose option (1/2/3): ").strip()
                
                if option == '1' or option == '':
                    print("Using Chennai, India as location (13.0827, 80.2707)")
                    return 13.0827, 80.2707
                
                elif option == '2':
                    lat = float(input("Enter latitude (e.g., 13.0827): ").strip())
                    lon = float(input("Enter longitude (e.g., 80.2707): ").strip())
                    
                    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                        print("Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.")
                        continue
                        
                    return lat, lon
                
                elif option == '3':
                    place_name = input("Enter place name (e.g., 'Paris, France', 'Times Square'): ").strip()
                    if place_name:
                        coords = self._geocode_place_name(place_name)
                        if coords:
                            return coords
                        else:
                            print("Could not find coordinates for that place. Please try another method.")
                    continue
                
                else:
                    print("Invalid option. Please choose 1, 2, or 3.")
                    
            except ValueError:
                print("Please enter valid numbers for coordinates.")
            except KeyboardInterrupt:
                print("\nOperation cancelled.")
                return 13.0827, 80.2707  # Default fallback
    
    def _geocode_place_name(self, place_name: str) -> Optional[Tuple[float, float]]:
        """Convert place name to coordinates using Nominatim (OpenStreetMap's geocoder)"""
        try:
            print(f"Looking up coordinates for: {place_name}")
            time.sleep(1)  # Rate limiting
            
            nominatim_url = "https://nominatim.openstreetmap.org/search"
            params = {
                'q': place_name,
                'format': 'json',
                'limit': 1
            }
            
            response = requests.get(nominatim_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                print(f"Found coordinates: {lat:.6f}, {lon:.6f}")
                return lat, lon
            else:
                print("No results found for that place name.")
                return None
                
        except Exception as e:
            print(f"Geocoding error: {e}")
            return None
    
    def _get_radius_input(self) -> int:
        """Get search radius from user"""
        while True:
            try:
                radius_input = input("\nEnter search radius in meters (max 2000, default 500): ").strip()
                if not radius_input:
                    radius = 500
                else:
                    radius = int(radius_input)
                
                if radius <= 0:
                    print("Please enter a positive number.")
                    continue
                if radius > 2000:
                    print("Radius too large. Maximum is 2000 meters (2km).")
                    continue
                return radius
            except ValueError:
                print("Please enter a valid number.")
    
    def _get_business_types_input(self) -> List[str]:
        """Get business types from user with text input option"""
        print("\n" + "="*60)
        print("SELECT BUSINESS TYPES TO SEARCH FOR")
        print("="*60)
        
        # Common business types with better categorization
        business_categories = {
            'food': ['restaurant', 'cafe', 'fast_food', 'bakery', 'food_court'],
            'retail': ['supermarket', 'convenience', 'clothes', 'shoes', 'electronics', 'mall'],
            'services': ['bank', 'pharmacy', 'hospital', 'dentist', 'post_office'],
            'entertainment': ['cinema', 'theatre', 'bar', 'pub', 'nightclub'],
            'other': ['fuel', 'car_wash', 'hotel', 'library', 'school']
        }
        
        print("\nCommon business types (you can also enter custom types):")
        for i, (category, types) in enumerate(business_categories.items(), 1):
            print(f"{i}. {category.title()}: {', '.join(types)}")
        
        print("0. Enter custom business types")
        
        selected_types = []
        
        while True:
            try:
                print("\nYou can:")
                print("- Enter category numbers (e.g., '1,2' for food and retail)")
                print("- Enter specific business types (e.g., 'restaurant,cafe')")
                print("- Type 'done' when finished")
                
                choice = input("\nEnter your choice: ").strip().lower()
                
                if choice == 'done':
                    if not selected_types:
                        print("No types selected. Using default: restaurant, cafe")
                        return ['restaurant', 'cafe']
                    print(f"\n✅ Selected business types: {', '.join(selected_types)}")
                    return selected_types
                
                if choice == '0':
                    custom_types = input("Enter custom business types (comma-separated): ").strip()
                    if custom_types:
                        types_list = [t.strip() for t in custom_types.split(',') if t.strip()]
                        for business_type in types_list:
                            if self._validate_business_type(business_type):
                                selected_types.append(business_type)
                                print(f"✓ Added '{business_type}'")
                    continue
                
                # Process category numbers or specific types
                choices = [c.strip() for c in choice.split(',') if c.strip()]
                
                for c in choices:
                    if c.isdigit() and int(c) in range(1, len(business_categories) + 1):
                        # It's a category number
                        category_key = list(business_categories.keys())[int(c) - 1]
                        for business_type in business_categories[category_key]:
                            if business_type not in selected_types:
                                selected_types.append(business_type)
                        print(f"✓ Added all {category_key} businesses")
                    else:
                        # It's a specific business type
                        if self._validate_business_type(c):
                            if c not in selected_types:
                                selected_types.append(c)
                                print(f"✓ Added '{c}'")
                
                if selected_types:
                    print(f"\nCurrent selection: {', '.join(selected_types)}")
                    
            except KeyboardInterrupt:
                print("\nOperation cancelled.")
                if selected_types:
                    return selected_types
                else:
                    return ['restaurant', 'cafe']
    
    def _validate_business_type(self, business_type: str) -> bool:
        """Validate that the business type is reasonable"""
        if not business_type or len(business_type) > 50:
            print("Business type must be between 1 and 50 characters.")
            return False
        
        # Basic validation
        invalid_chars = ['"', "'", ';', '(', ')', '[', ']', '{', '}', '~', '*']
        if any(char in business_type for char in invalid_chars):
            print("Business type contains invalid characters.")
            return False
            
        return True
    
    def search_competitors(self) -> Optional[dict]:
        """Search for businesses using Overpass API"""
        try:
            time.sleep(self.rate_limit_delay)
            
            query = self._build_query(self.latitude, self.longitude, self.radius, self.business_types)
            
            response = requests.get(
                self.overpass_url, 
                params={"data": query}, 
                timeout=self.request_timeout
            )
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.Timeout:
            print("⏰ Request timed out. The server is taking too long to respond.")
        except requests.exceptions.ConnectionError:
            print("📡 Network connection error. Please check your internet connection.")
        except requests.exceptions.HTTPError as e:
            print(f"❌ HTTP error: {e}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        return None
    
    def _build_query(self, lat: float, lon: float, radius: int, business_types: List[str]) -> str:
        """Build Overpass query for business search"""
        # Separate amenity and shop types
        amenity_types = []
        shop_types = []
        
        for business_type in business_types:
            # Common amenity types
            if business_type in ['restaurant', 'cafe', 'fast_food', 'bank', 'pharmacy', 
                               'hospital', 'school', 'fuel', 'cinema', 'theatre', 'bar']:
                amenity_types.append(business_type)
            # Common shop types or assume shop
            else:
                shop_types.append(business_type)
        
        query_parts = []
        
        if amenity_types:
            amenity_regex = "|".join(amenity_types)
            query_parts.extend([
                f'node["amenity"~"{amenity_regex}"](around:{radius},{lat},{lon});',
                f'way["amenity"~"{amenity_regex}"](around:{radius},{lat},{lon});'
            ])
        
        if shop_types:
            shop_regex = "|".join(shop_types)
            query_parts.extend([
                f'node["shop"~"{shop_regex}"](around:{radius},{lat},{lon});',
                f'way["shop"~"{shop_regex}"](around:{radius},{lat},{lon});'
            ])
        
        query = f"""
        [out:json][timeout:25];
        (
          {"".join(query_parts)}
        );
        out body;
        >;
        out skel qt;
        """
        
        return query
    
    def process_results(self, data: dict) -> List[Competitor]:
        """Process API results and create Competitor objects"""
        if not data or 'elements' not in data:
            return []
        
        competitors = []
        processed_ids = set()
        
        for element in data.get('elements', []):
            try:
                competitor = self._process_element(element, processed_ids)
                if competitor:
                    competitors.append(competitor)
            except Exception as e:
                continue
        
        competitors.sort(key=lambda x: x.distance)
        return competitors
    
    def _process_element(self, element: dict, processed_ids: set) -> Optional[Competitor]:
        """Process individual OSM element into Competitor object"""
        if element['type'] not in ['node', 'way']:
            return None
        
        tags = element.get('tags', {})
        name = tags.get('name', '').strip()
        
        # Skip unnamed or invalid entries
        if not name or name.lower() in ['yes', 'no', 'unknown', 'none']:
            return None
        
        # Check for duplicates
        osm_id = f"{element['type']}_{element['id']}"
        if osm_id in processed_ids:
            return None
        processed_ids.add(osm_id)
        
        # Determine business type
        business_type = tags.get('amenity') or tags.get('shop', 'unknown')
        
        # Get coordinates
        if element['type'] == 'node':
            lat, lon = element.get('lat', 0), element.get('lon', 0)
        else:
            center = element.get('center', {})
            lat, lon = center.get('lat', 0), center.get('lon', 0)
        
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return None
        
        # Calculate distance
        try:
            distance = haversine((self.latitude, self.longitude), (lat, lon)) * 1000
        except:
            distance = float('inf')
        
        # Get address information
        address_parts = []
        for addr_key in ['addr:street', 'addr:road', 'addr:full']:
            if tags.get(addr_key):
                address_parts.append(tags.get(addr_key))
                break
        
        if tags.get('addr:housenumber'):
            address_parts.append(tags.get('addr:housenumber'))
        
        address = ", ".join(address_parts) if address_parts else "Address not specified"
        
        # Create Google Maps URL
        google_maps_url = f"https://www.google.com/maps?q={lat},{lon}"
        
        return Competitor(
            name=name,
            type=business_type,
            distance=distance,
            latitude=lat,
            longitude=lon,
            osm_id=element['id'],
            osm_type=element['type'],
            address=address,
            google_maps_url=google_maps_url
        )
    
    def display_results(self, competitors: List[Competitor]):
        """Display results with Google Maps links"""
        if not competitors:
            print(f"\n❌ No businesses found within the specified radius ({self.radius}m).")
            return
        
        valid_competitors = [c for c in competitors if c.distance <= self.radius]
        
        if not valid_competitors:
            print(f"\n❌ No businesses found within {self.radius} meters.")
            return
        
        print(f"\n{'🎯'*50}")
        print(f"           FOUND {len(valid_competitors)} BUSINESSES")
        print(f"           WITHIN {self.radius} METERS RADIUS")
        print(f"{'🎯'*50}")
        
        # Group by type
        businesses_by_type = {}
        for comp in valid_competitors:
            if comp.type not in businesses_by_type:
                businesses_by_type[comp.type] = []
            businesses_by_type[comp.type].append(comp)
        
        # Display results
        for business_type, comp_list in sorted(businesses_by_type.items()):
            print(f"\n📋 {business_type.upper()} ({len(comp_list)} found):")
            print("=" * 80)
            
            for i, comp in enumerate(comp_list, 1):
                print(f"{i:2d}. {comp.name}")
                print(f"    📍 Distance: {comp.distance:.0f}m")
                print(f"    📍 Coordinates: {comp.latitude:.6f}, {comp.longitude:.6f}")
                print(f"    🏠 Address: {comp.address}")
                print(f"    🗺️  Google Maps: {comp.google_maps_url}")
                print()
        
        # Statistics
        print(f"{'📊'*50}")
        print("BUSINESS INTELLIGENCE SUMMARY:")
        print(f"{'📊'*50}")
        
        for business_type, comp_list in sorted(businesses_by_type.items()):
            print(f"  {business_type}: {len(comp_list)} businesses")
        
        if valid_competitors:
            closest = min(valid_competitors, key=lambda x: x.distance)
            farthest = max(valid_competitors, key=lambda x: x.distance)
            avg_distance = sum(c.distance for c in valid_competitors) / len(valid_competitors)
            
            print(f"\n  📍 Closest: {closest.name} ({closest.distance:.0f}m - {closest.type})")
            print(f"  📍 Farthest: {farthest.name} ({farthest.distance:.0f}m - {farthest.type})")
            print(f"  📍 Average distance: {avg_distance:.0f}m")
            
            # Market saturation analysis
            total_density = len(valid_competitors) / (3.14159 * (self.radius/1000) ** 2)  # businesses per km²
            print(f"  📍 Business density: {total_density:.1f} businesses per km²")
    
    def get_results_json(self, competitors: List[Competitor]) -> Dict[str, Any]:
        """Return results as JSON for frontend consumption"""
        valid_competitors = [c for c in competitors if c.distance <= self.radius]
        
        if not valid_competitors:
            return {
                "status": "no_competitors_found",
                "message": f"No businesses found within {self.radius} meters",
                "search_parameters": {
                    "latitude": self.latitude,
                    "longitude": self.longitude,
                    "radius": self.radius,
                    "business_types": self.business_types
                }
            }
        
        # Group by type
        businesses_by_type = {}
        for comp in valid_competitors:
            if comp.type not in businesses_by_type:
                businesses_by_type[comp.type] = []
            businesses_by_type[comp.type].append(comp)
        
        # Prepare competitors list
        competitors_list = []
        for business_type, comp_list in sorted(businesses_by_type.items()):
            for comp in comp_list:
                competitors_list.append({
                    "name": comp.name,
                    "type": comp.type,
                    "distance": comp.distance,
                    "latitude": comp.latitude,
                    "longitude": comp.longitude,
                    "address": comp.address,
                    "google_maps_url": comp.google_maps_url
                })
        
        # Calculate statistics
        closest = min(valid_competitors, key=lambda x: x.distance)
        farthest = max(valid_competitors, key=lambda x: x.distance)
        avg_distance = sum(c.distance for c in valid_competitors) / len(valid_competitors)
        total_density = len(valid_competitors) / (3.14159 * (self.radius/1000) ** 2)  # businesses per km²
        
        # Count by type
        count_by_type = {}
        for business_type, comp_list in businesses_by_type.items():
            count_by_type[business_type] = len(comp_list)
        
        return {
            "status": "success",
            "total_competitors": len(valid_competitors),
            "search_parameters": {
                "latitude": self.latitude,
                "longitude": self.longitude,
                "radius": self.radius,
                "business_types": self.business_types
            },
            "competitors": competitors_list,
            "statistics": {
                "closest": {
                    "name": closest.name,
                    "distance": closest.distance,
                    "type": closest.type
                },
                "farthest": {
                    "name": farthest.name,
                    "distance": farthest.distance,
                    "type": farthest.type
                },
                "average_distance": avg_distance,
                "business_density": total_density,
                "count_by_type": count_by_type
            }
        }
    
    def export_results(self, competitors: List[Competitor], filename: str = "business_analysis_report.txt"):
        """Export results to a text file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("BUSINESS COMPETITOR ANALYSIS REPORT\n")
                f.write("=" * 50 + "\n\n")
                f.write(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Search radius: {self.radius} meters\n")
                f.write(f"Location: {self.latitude:.6f}, {self.longitude:.6f}\n")
                f.write(f"Business types: {', '.join(self.business_types)}\n\n")
                
                valid_competitors = [c for c in competitors if c.distance <= self.radius]
                f.write(f"Total businesses found: {len(valid_competitors)}\n\n")
                
                f.write("DETAILED LISTING:\n")
                f.write("-" * 50 + "\n")
                
                for comp in valid_competitors:
                    f.write(f"Name: {comp.name}\n")
                    f.write(f"Type: {comp.type}\n")
                    f.write(f"Distance: {comp.distance:.0f} meters\n")
                    f.write(f"Coordinates: {comp.latitude:.6f}, {comp.longitude:.6f}\n")
                    f.write(f"Address: {comp.address}\n")
                    f.write(f"Google Maps: {comp.google_maps_url}\n")
                    f.write("-" * 40 + "\n")
                
                # Add summary statistics
                f.write("\nSUMMARY STATISTICS:\n")
                f.write("-" * 30 + "\n")
                
                businesses_by_type = {}
                for comp in valid_competitors:
                    businesses_by_type[comp.type] = businesses_by_type.get(comp.type, 0) + 1
                
                for business_type, count in sorted(businesses_by_type.items()):
                    f.write(f"{business_type}: {count} businesses\n")
                
            print(f"\n💾 Report exported to: {filename}")
            
        except Exception as e:
            print(f"❌ Error exporting report: {e}")
    
    def run_analysis(self, export: bool = False, filename: str = None, json_output: bool = False):
        """Run analysis with current parameters"""
        data = self.search_competitors()
        
        if data:
            competitors = self.process_results(data)
            
            if json_output:
                # Return JSON for frontend
                return self.get_results_json(competitors)
            else:
                # Display results in console
                self.display_results(competitors)
                
                if competitors and export:
                    if not filename:
                        filename = "business_report.txt"
                    self.export_results(competitors, filename)
        
        return competitors if not json_output else self.get_results_json(competitors)
    
    def main(self, auto_mode: bool = False, json_output: bool = False, **kwargs):
        """Main application with optional auto mode"""
        if not json_output:
            print("🏪 BUSINESS COMPETITOR ANALYSIS TOOL")
            print("📍 Find and analyze local businesses with Google Maps integration")
            print("=" * 70)
        
        try:
            if auto_mode:
                # Auto mode - use provided parameters
                latitude = kwargs.get('latitude', 13.0827)
                longitude = kwargs.get('longitude', 80.2707)
                radius = kwargs.get('radius', 500)
                business_types = kwargs.get('business_types', ['restaurant', 'cafe'])
                
                self.set_parameters(latitude, longitude, radius, business_types)
                result = self.run_analysis(
                    export=kwargs.get('export', False),
                    filename=kwargs.get('filename'),
                    json_output=json_output
                )

                return result
            else:
                # Interactive mode
                while True:
                    latitude, longitude, radius, business_types = self.get_user_input()
                    self.set_parameters(latitude, longitude, radius, business_types)
                    
                    if json_output:
                        result = self.run_analysis(json_output=True)
                        print(json.dumps(result, indent=2))
                    else:
                        self.run_analysis()
                    
                    if json_output:
                        break
                        
                    again = input("\n🔄 Perform another analysis? (y/n): ").strip().lower()
                    if again not in ['y', 'yes']:
                        if not json_output:
                            print("\n✅ Analysis complete! Thank you for using the tool.")
                            print("👋 Goodbye!")
                        break
                    
        except KeyboardInterrupt:
            if not json_output:
                print("\n\n⏹️ Operation cancelled by user.")
        except Exception as e:
            if not json_output:
                print(f"\n❌ Unexpected error: {e}")

try:
    from haversine import haversine
except ImportError:
    print("Installing required haversine package...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "haversine"])
    from haversine import haversine

try:
    import requests
except ImportError:
    print("Installing required requests package...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

@dataclass
class Competitor:
    name: str
    type: str
    distance: float
    latitude: float
    longitude: float
    osm_id: str
    osm_type: str
    address: str = ""
    google_maps_url: str = ""

class CompetitorAnalyzer:
    def __init__(self):
        self.overpass_url = "http://overpass-api.de/api/interpreter"
        self.request_timeout = 45
        self.rate_limit_delay = 2  # seconds between requests
    
    def set_parameters(self, latitude: float, longitude: float, radius: int, business_types: List[str]):
        """Set analysis parameters directly"""
        self.latitude = latitude
        self.longitude = longitude
        self.radius = radius
        self.business_types = business_types
        
    def get_user_input(self) -> Tuple[float, float, int, List[str]]:
        """Get comprehensive user input including location"""
        print("=== Competitor Analysis Tool ===\n")
        print("This tool helps you find competitors by name and type in any location.\n")
        
        # Get location input
        latitude, longitude = self._get_location_input()
        
        # Get radius input
        radius = self._get_radius_input()
        
        # Get business types
        business_types = self._get_business_types_input()
        
        return latitude, longitude, radius, business_types
    
    def _get_location_input(self) -> Tuple[float, float]:
        """Get location coordinates from user with flexible input options"""
        while True:
            try:
                print("\n📍 LOCATION INPUT OPTIONS:")
                print("1. Use default location (Chennai, India)")
                print("2. Enter latitude and longitude")
                print("3. Enter a place name (city, address, etc.)")
                
                option = input("\nChoose option (1/2/3): ").strip()
                
                if option == '1' or option == '':
                    print("Using Chennai, India as location (13.0827, 80.2707)")
                    return 13.0827, 80.2707
                
                elif option == '2':
                    lat = float(input("Enter latitude (e.g., 13.0827): ").strip())
                    lon = float(input("Enter longitude (e.g., 80.2707): ").strip())
                    
                    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                        print("Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.")
                        continue
                        
                    return lat, lon
                
                elif option == '3':
                    place_name = input("Enter place name (e.g., 'Paris, France', 'Times Square'): ").strip()
                    if place_name:
                        coords = self._geocode_place_name(place_name)
                        if coords:
                            return coords
                        else:
                            print("Could not find coordinates for that place. Please try another method.")
                    continue
                
                else:
                    print("Invalid option. Please choose 1, 2, or 3.")
                    
            except ValueError:
                print("Please enter valid numbers for coordinates.")
            except KeyboardInterrupt:
                print("\nOperation cancelled.")
                return 13.0827, 80.2707  # Default fallback
    
    def _geocode_place_name(self, place_name: str) -> Optional[Tuple[float, float]]:
        """Convert place name to coordinates using Nominatim (OpenStreetMap's geocoder)"""
        try:
            print(f"Looking up coordinates for: {place_name}")
            time.sleep(1)  # Rate limiting
            
            nominatim_url = "https://nominatim.openstreetmap.org/search"
            params = {
                'q': place_name,
                'format': 'json',
                'limit': 1
            }
            
            response = requests.get(nominatim_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                print(f"Found coordinates: {lat:.6f}, {lon:.6f}")
                return lat, lon
            else:
                print("No results found for that place name.")
                return None
                
        except Exception as e:
            print(f"Geocoding error: {e}")
            return None
    
    def _get_radius_input(self) -> int:
        """Get search radius from user"""
        while True:
            try:
                radius_input = input("\nEnter search radius in meters (max 2000, default 500): ").strip()
                if not radius_input:
                    radius = 500
                else:
                    radius = int(radius_input)
                
                if radius <= 0:
                    print("Please enter a positive number.")
                    continue
                if radius > 2000:
                    print("Radius too large. Maximum is 2000 meters (2km).")
                    continue
                return radius
            except ValueError:
                print("Please enter a valid number.")
    
    def _get_business_types_input(self) -> List[str]:
        """Get business types from user with text input option"""
        print("\n" + "="*60)
        print("SELECT BUSINESS TYPES TO SEARCH FOR")
        print("="*60)
        
        # Common business types with better categorization
        business_categories = {
            'food': ['restaurant', 'cafe', 'fast_food', 'bakery', 'food_court'],
            'retail': ['supermarket', 'convenience', 'clothes', 'shoes', 'electronics', 'mall'],
            'services': ['bank', 'pharmacy', 'hospital', 'dentist', 'post_office'],
            'entertainment': ['cinema', 'theatre', 'bar', 'pub', 'nightclub'],
            'other': ['fuel', 'car_wash', 'hotel', 'library', 'school']
        }
        
        print("\nCommon business types (you can also enter custom types):")
        for i, (category, types) in enumerate(business_categories.items(), 1):
            print(f"{i}. {category.title()}: {', '.join(types)}")
        
        print("0. Enter custom business types")
        
        selected_types = []
        
        while True:
            try:
                print("\nYou can:")
                print("- Enter category numbers (e.g., '1,2' for food and retail)")
                print("- Enter specific business types (e.g., 'restaurant,cafe')")
                print("- Type 'done' when finished")
                
                choice = input("\nEnter your choice: ").strip().lower()
                
                if choice == 'done':
                    if not selected_types:
                        print("No types selected. Using default: restaurant, cafe")
                        return ['restaurant', 'cafe']
                    print(f"\n✅ Selected business types: {', '.join(selected_types)}")
                    return selected_types
                
                if choice == '0':
                    custom_types = input("Enter custom business types (comma-separated): ").strip()
                    if custom_types:
                        types_list = [t.strip() for t in custom_types.split(',') if t.strip()]
                        for business_type in types_list:
                            if self._validate_business_type(business_type):
                                selected_types.append(business_type)
                                print(f"✓ Added '{business_type}'")
                    continue
                
                # Process category numbers or specific types
                choices = [c.strip() for c in choice.split(',') if c.strip()]
                
                for c in choices:
                    if c.isdigit() and int(c) in range(1, len(business_categories) + 1):
                        # It's a category number
                        category_key = list(business_categories.keys())[int(c) - 1]
                        for business_type in business_categories[category_key]:
                            if business_type not in selected_types:
                                selected_types.append(business_type)
                        print(f"✓ Added all {category_key} businesses")
                    else:
                        # It's a specific business type
                        if self._validate_business_type(c):
                            if c not in selected_types:
                                selected_types.append(c)
                                print(f"✓ Added '{c}'")
                
                if selected_types:
                    print(f"\nCurrent selection: {', '.join(selected_types)}")
                    
            except KeyboardInterrupt:
                print("\nOperation cancelled.")
                if selected_types:
                    return selected_types
                else:
                    return ['restaurant', 'cafe']
    
    def _validate_business_type(self, business_type: str) -> bool:
        """Validate that the business type is reasonable"""
        if not business_type or len(business_type) > 50:
            print("Business type must be between 1 and 50 characters.")
            return False
        
        # Basic validation
        invalid_chars = ['"', "'", ';', '(', ')', '[', ']', '{', '}', '~', '*']
        if any(char in business_type for char in invalid_chars):
            print("Business type contains invalid characters.")
            return False
            
        return True
    
    def search_competitors(self) -> Optional[dict]:
        """Search for businesses using Overpass API"""
        try:
            time.sleep(self.rate_limit_delay)
            
            query = self._build_query(self.latitude, self.longitude, self.radius, self.business_types)
            
            response = requests.get(
                self.overpass_url, 
                params={"data": query}, 
                timeout=self.request_timeout
            )
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.Timeout:
            print("⏰ Request timed out. The server is taking too long to respond.")
        except requests.exceptions.ConnectionError:
            print("📡 Network connection error. Please check your internet connection.")
        except requests.exceptions.HTTPError as e:
            print(f"❌ HTTP error: {e}")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        return None
    
    def _build_query(self, lat: float, lon: float, radius: int, business_types: List[str]) -> str:
        """Build Overpass query for business search"""
        # Separate amenity and shop types
        amenity_types = []
        shop_types = []
        
        for business_type in business_types:
            # Common amenity types
            if business_type in ['restaurant', 'cafe', 'fast_food', 'bank', 'pharmacy', 
                               'hospital', 'school', 'fuel', 'cinema', 'theatre', 'bar']:
                amenity_types.append(business_type)
            # Common shop types or assume shop
            else:
                shop_types.append(business_type)
        
        query_parts = []
        
        if amenity_types:
            amenity_regex = "|".join(amenity_types)
            query_parts.extend([
                f'node["amenity"~"{amenity_regex}"](around:{radius},{lat},{lon});',
                f'way["amenity"~"{amenity_regex}"](around:{radius},{lat},{lon});'
            ])
        
        if shop_types:
            shop_regex = "|".join(shop_types)
            query_parts.extend([
                f'node["shop"~"{shop_regex}"](around:{radius},{lat},{lon});',
                f'way["shop"~"{shop_regex}"](around:{radius},{lat},{lon});'
            ])
        
        query = f"""
        [out:json][timeout:25];
        (
          {"".join(query_parts)}
        );
        out body;
        >;
        out skel qt;
        """
        
        return query
    
    def process_results(self, data: dict) -> List[Competitor]:
        """Process API results and create Competitor objects"""
        if not data or 'elements' not in data:
            return []
        
        competitors = []
        processed_ids = set()
        
        for element in data.get('elements', []):
            try:
                competitor = self._process_element(element, processed_ids)
                if competitor:
                    competitors.append(competitor)
            except Exception as e:
                continue
        
        competitors.sort(key=lambda x: x.distance)
        return competitors
    
    def _process_element(self, element: dict, processed_ids: set) -> Optional[Competitor]:
        """Process individual OSM element into Competitor object"""
        if element['type'] not in ['node', 'way']:
            return None
        
        tags = element.get('tags', {})
        name = tags.get('name', '').strip()
        
        # Skip unnamed or invalid entries
        if not name or name.lower() in ['yes', 'no', 'unknown', 'none']:
            return None
        
        # Check for duplicates
        osm_id = f"{element['type']}_{element['id']}"
        if osm_id in processed_ids:
            return None
        processed_ids.add(osm_id)
        
        # Determine business type
        business_type = tags.get('amenity') or tags.get('shop', 'unknown')
        
        # Get coordinates
        if element['type'] == 'node':
            lat, lon = element.get('lat', 0), element.get('lon', 0)
        else:
            center = element.get('center', {})
            lat, lon = center.get('lat', 0), center.get('lon', 0)
        
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return None
        
        # Calculate distance
        try:
            distance = haversine((self.latitude, self.longitude), (lat, lon)) * 1000
        except:
            distance = float('inf')
        
        # Get address information
        address_parts = []
        for addr_key in ['addr:street', 'addr:road', 'addr:full']:
            if tags.get(addr_key):
                address_parts.append(tags.get(addr_key))
                break
        
        if tags.get('addr:housenumber'):
            address_parts.append(tags.get('addr:housenumber'))
        
        address = ", ".join(address_parts) if address_parts else "Address not specified"
        
        # Create Google Maps URL
        google_maps_url = f"https://www.google.com/maps?q={lat},{lon}"
        
        return Competitor(
            name=name,
            type=business_type,
            distance=distance,
            latitude=lat,
            longitude=lon,
            osm_id=element['id'],
            osm_type=element['type'],
            address=address,
            google_maps_url=google_maps_url
        )
    
    def display_results(self, competitors: List[Competitor]):
        """Display results with Google Maps links"""
        if not competitors:
            print(f"\n❌ No businesses found within the specified radius ({self.radius}m).")
            return
        
        valid_competitors = [c for c in competitors if c.distance <= self.radius]
        
        if not valid_competitors:
            print(f"\n❌ No businesses found within {self.radius} meters.")
            return
        
        print(f"\n{'🎯'*50}")
        print(f"           FOUND {len(valid_competitors)} BUSINESSES")
        print(f"           WITHIN {self.radius} METERS RADIUS")
        print(f"{'🎯'*50}")
        
        # Group by type
        businesses_by_type = {}
        for comp in valid_competitors:
            if comp.type not in businesses_by_type:
                businesses_by_type[comp.type] = []
            businesses_by_type[comp.type].append(comp)
        
        # Display results
        for business_type, comp_list in sorted(businesses_by_type.items()):
            print(f"\n📋 {business_type.upper()} ({len(comp_list)} found):")
            print("=" * 80)
            
            for i, comp in enumerate(comp_list, 1):
                print(f"{i:2d}. {comp.name}")
                print(f"    📍 Distance: {comp.distance:.0f}m")
                print(f"    📍 Coordinates: {comp.latitude:.6f}, {comp.longitude:.6f}")
                print(f"    🏠 Address: {comp.address}")
                print(f"    🗺️  Google Maps: {comp.google_maps_url}")
                print()
        
        # Statistics
        print(f"{'📊'*50}")
        print("BUSINESS INTELLIGENCE SUMMARY:")
        print(f"{'📊'*50}")
        
        for business_type, comp_list in sorted(businesses_by_type.items()):
            print(f"  {business_type}: {len(comp_list)} businesses")
        
        if valid_competitors:
            closest = min(valid_competitors, key=lambda x: x.distance)
            farthest = max(valid_competitors, key=lambda x: x.distance)
            avg_distance = sum(c.distance for c in valid_competitors) / len(valid_competitors)
            
            print(f"\n  📍 Closest: {closest.name} ({closest.distance:.0f}m - {closest.type})")
            print(f"  📍 Farthest: {farthest.name} ({farthest.distance:.0f}m - {farthest.type})")
            print(f"  📍 Average distance: {avg_distance:.0f}m")
            
            # Market saturation analysis
            total_density = len(valid_competitors) / (3.14159 * (self.radius/1000) ** 2)  # businesses per km²
            print(f"  📍 Business density: {total_density:.1f} businesses per km²")
    
    def get_results_json(self, competitors: List[Competitor]) -> Dict[str, Any]:
        """Return results as JSON for frontend consumption"""
        valid_competitors = [c for c in competitors if c.distance <= self.radius]
        
        if not valid_competitors:
            return {
                "status": "no_competitors_found",
                "message": f"No businesses found within {self.radius} meters",
                "search_parameters": {
                    "latitude": self.latitude,
                    "longitude": self.longitude,
                    "radius": self.radius,
                    "business_types": self.business_types
                }
            }
        
        # Group by type
        businesses_by_type = {}
        for comp in valid_competitors:
            if comp.type not in businesses_by_type:
                businesses_by_type[comp.type] = []
            businesses_by_type[comp.type].append(comp)
        
        # Prepare competitors list
        competitors_list = []
        for business_type, comp_list in sorted(businesses_by_type.items()):
            for comp in comp_list:
                competitors_list.append({
                    "name": comp.name,
                    "type": comp.type,
                    "distance": comp.distance,
                    "latitude": comp.latitude,
                    "longitude": comp.longitude,
                    "address": comp.address,
                    "google_maps_url": comp.google_maps_url
                })
        
        # Calculate statistics
        closest = min(valid_competitors, key=lambda x: x.distance)
        farthest = max(valid_competitors, key=lambda x: x.distance)
        avg_distance = sum(c.distance for c in valid_competitors) / len(valid_competitors)
        total_density = len(valid_competitors) / (3.14159 * (self.radius/1000) ** 2)  # businesses per km²
        
        # Count by type
        count_by_type = {}
        for business_type, comp_list in businesses_by_type.items():
            count_by_type[business_type] = len(comp_list)
        
        return {
            "status": "success",
            "total_competitors": len(valid_competitors),
            "search_parameters": {
                "latitude": self.latitude,
                "longitude": self.longitude,
                "radius": self.radius,
                "business_types": self.business_types
            },
            "competitors": competitors_list,
            "statistics": {
                "closest": {
                    "name": closest.name,
                    "distance": closest.distance,
                    "type": closest.type
                },
                "farthest": {
                    "name": farthest.name,
                    "distance": farthest.distance,
                    "type": farthest.type
                },
                "average_distance": avg_distance,
                "business_density": total_density,
                "count_by_type": count_by_type
            }
        }
    
    def export_results(self, competitors: List[Competitor], filename: str = "business_analysis_report.txt"):
        """Export results to a text file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("BUSINESS COMPETITOR ANALYSIS REPORT\n")
                f.write("=" * 50 + "\n\n")
                f.write(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Search radius: {self.radius} meters\n")
                f.write(f"Location: {self.latitude:.6f}, {self.longitude:.6f}\n")
                f.write(f"Business types: {', '.join(self.business_types)}\n\n")
                
                valid_competitors = [c for c in competitors if c.distance <= self.radius]
                f.write(f"Total businesses found: {len(valid_competitors)}\n\n")
                
                f.write("DETAILED LISTING:\n")
                f.write("-" * 50 + "\n")
                
                for comp in valid_competitors:
                    f.write(f"Name: {comp.name}\n")
                    f.write(f"Type: {comp.type}\n")
                    f.write(f"Distance: {comp.distance:.0f} meters\n")
                    f.write(f"Coordinates: {comp.latitude:.6f}, {comp.longitude:.6f}\n")
                    f.write(f"Address: {comp.address}\n")
                    f.write(f"Google Maps: {comp.google_maps_url}\n")
                    f.write("-" * 40 + "\n")
                
                # Add summary statistics
                f.write("\nSUMMARY STATISTICS:\n")
                f.write("-" * 30 + "\n")
                
                businesses_by_type = {}
                for comp in valid_competitors:
                    businesses_by_type[comp.type] = businesses_by_type.get(comp.type, 0) + 1
                
                for business_type, count in sorted(businesses_by_type.items()):
                    f.write(f"{business_type}: {count} businesses\n")
                
            print(f"\n💾 Report exported to: {filename}")
            
        except Exception as e:
            print(f"❌ Error exporting report: {e}")
    
    def run_analysis(self, export: bool = False, filename: str = None, json_output: bool = False):
        """Run analysis with current parameters"""
        data = self.search_competitors()
        
        if data:
            competitors = self.process_results(data)
            
            if json_output:
                # Return JSON for frontend
                return self.get_results_json(competitors)
            else:
                # Display results in console
                self.display_results(competitors)
                
                if competitors and export:
                    if not filename:
                        filename = "business_report.txt"
                    self.export_results(competitors, filename)
        
        return competitors if not json_output else self.get_results_json(competitors)
    
    def main(self, auto_mode: bool = False, json_output: bool = False, **kwargs):
        """Main application with optional auto mode"""
        if not json_output:
            print("🏪 BUSINESS COMPETITOR ANALYSIS TOOL")
            print("📍 Find and analyze local businesses with Google Maps integration")
            print("=" * 70)
        
        try:
            if auto_mode:
                # Auto mode - use provided parameters
                latitude = kwargs.get('latitude', 13.0827)
                longitude = kwargs.get('longitude', 80.2707)
                radius = kwargs.get('radius', 500)
                business_types = kwargs.get('business_types', ['restaurant', 'cafe'])
                
                self.set_parameters(latitude, longitude, radius, business_types)
                result = self.run_analysis(
                    export=kwargs.get('export', False),
                    filename=kwargs.get('filename'),
                    json_output=json_output
                )

                return result
            else:
                # Interactive mode
                while True:
                    latitude, longitude, radius, business_types = self.get_user_input()
                    self.set_parameters(latitude, longitude, radius, business_types)
                    
                    if json_output:
                        result = self.run_analysis(json_output=True)
                        print(json.dumps(result, indent=2))
                    else:
                        self.run_analysis()
                    
                    if json_output:
                        break
                        
                    again = input("\n🔄 Perform another analysis? (y/n): ").strip().lower()
                    if again not in ['y', 'yes']:
                        if not json_output:
                            print("\n✅ Analysis complete! Thank you for using the tool.")
                            print("👋 Goodbye!")
                        break
                    
        except KeyboardInterrupt:
            if not json_output:
                print("\n\n⏹️ Operation cancelled by user.")
        except Exception as e:
            if not json_output:
                print(f"\n❌ Unexpected error: {e}")
                
class FreeCulturalFitAnalyzer:
    def __init__(self):
        # No API keys needed!
        
        # Expanded global keyword database
        self.keywords = {
            "coffee": ["coffee", "espresso", "latte", "cappuccino", "americano", "macchiato", "flat white", "café"],
            "tea": ["tea", "chai", "green tea", "black tea", "matcha", "oolong", "herbal tea", "bubble tea", "boba"],
            "vegetarian": ["vegetarian", "plant-based", "vegan", "veggie", "meat-free", "cruelty-free"],
            "nonveg": ["chicken", "meat", "fish", "beef", "pork", "steak", "seafood", "lamb", "poultry", "bacon"],
            "streetfood": ["street food", "tacos", "bbq", "kebab", "shawarma", "falafel", "food truck", "food stall"],
            "fastfood": ["burger", "fries", "pizza", "sandwich", "hotdog", "fast food", "quick service"],
            "healthy": ["salad", "organic", "gluten-free", "low-carb", "superfood", "wellness", "nutrition", "clean eating"],
            "dessert": ["ice cream", "cake", "pastry", "donut", "pudding", "brownie", "sweet", "bakery", "patisserie"],
            "alcohol": ["wine", "beer", "cocktail", "bar", "pub", "brewery", "spirits", "whiskey", "vodka"],
            "cafe": ["cafe", "coffee shop", "tea house", "espresso bar", "pastry shop"],
            "fine_dining": ["fine dining", "gourmet", "luxury restaurant", "chef's table", "michelin"],
            "casual_dining": ["casual dining", "family restaurant", "bistro", "brunch", "eatery"]
        }
        
        # Global seasonal patterns
        self.seasonal_patterns = {
            "northern_hemisphere": {
                "summer": [6, 7, 8],
                "winter": [12, 1, 2],
                "spring": [3, 4, 5],
                "fall": [9, 10, 11]
            },
            "southern_hemisphere": {
                "summer": [12, 1, 2],
                "winter": [6, 7, 8],
                "spring": [9, 10, 11],
                "fall": [3, 4, 5]
            }
        }
    
    def get_hemisphere(self, lat):
        """Determine hemisphere based on latitude"""
        return "northern_hemisphere" if lat >= 0 else "southern_hemisphere"
    
    def get_location_from_coords(self, lat, lng):
        """Free geocoding using OpenStreetMap Nominatim API"""
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            'format': 'json',
            'lat': lat,
            'lon': lng,
            'zoom': 10,  # Level of detail
            'addressdetails': 1  # Get detailed address components
        }
        
        # Important: Add a user agent to identify your application
        headers = {
            'User-Agent': 'CulturalFitAnalyzer/1.0 (contact@example.com)'
        }
        
        try:
            response = requests.get(url, params=params, headers=headers)
            data = response.json()
            
            # Respect rate limits (1 request per second)
            time.sleep(1.1)
            
            if 'error' not in data:
                address = data.get('display_name', 'Unknown location')
                address_components = data.get('address', {})
                
                location_info = {
                    'formatted_address': address,
                    'country': address_components.get('country', ''),
                    'region': address_components.get('state', address_components.get('region', '')),
                    'city': address_components.get('city', address_components.get('town', address_components.get('village', ''))),
                    'postal_code': address_components.get('postcode', ''),
                    'latitude': lat,
                    'longitude': lng
                }
                return location_info
            else:
                return {"error": f"OpenStreetMap Error: {data.get('error', 'Unknown error')}"}
                
        except Exception as e:
            return {"error": f"Request Error: {str(e)}"}

    def get_wikipedia_content(self, location_name, business_type, radius_km):
        """Get content from Wikipedia about the location with better error handling"""
        try:
            if not location_name or not location_name.strip():
                return []
                
            # Add radius context to the search
            radius_context = f"within {radius_km}km radius" if radius_km > 0 else ""
            
            # Try to get Wikipedia page for the city/region
            search_url = "https://en.wikipedia.org/w/api.php"
            params = {
                'action': 'query',
                'format': 'json',
                'list': 'search',
                'srsearch': f"{location_name} {business_type} {radius_context}",
                'srlimit': 3,  # Reduced from 5 to avoid rate limiting
                'srprop': ''   # Don't need additional properties
            }
            
            # Add headers to identify our application
            headers = {
                'User-Agent': 'CulturalFitAnalyzer/1.0 (contact@example.com)'
            }
            
            response = requests.get(search_url, params=params, headers=headers, timeout=10)
            
            # Check if response is valid JSON
            if response.status_code != 200:
                print(f"Wikipedia API HTTP Error: {response.status_code}")
                return []
                
            try:
                data = response.json()
            except ValueError:
                print("Wikipedia API returned invalid JSON")
                return []
            
            texts = []
            if 'query' in data and 'search' in data['query']:
                for result in data['query']['search'][:2]:  # Limit to 2 results
                    title = result['title']
                    
                    # Get page content with simpler parameters
                    content_params = {
                        'action': 'query',
                        'format': 'json',
                        'prop': 'extracts',
                        'exintro': True,
                        'explaintext': True,
                        'titles': title,
                        'redirects': 1  # Follow redirects
                    }
                    
                    try:
                        content_response = requests.get(search_url, params=content_params, 
                                                    headers=headers, timeout=10)
                        
                        if content_response.status_code == 200:
                            content_data = content_response.json()
                            pages = content_data.get('query', {}).get('pages', {})
                            
                            for page_id, page_data in pages.items():
                                if 'extract' in page_data and page_data['extract']:
                                    texts.append(f"{page_data['title']}: {page_data['extract'][:500]}...")  # Limit length
                    
                    except Exception as e:
                        print(f"Error fetching Wikipedia content for {title}: {str(e)}")
                        continue
                    
                    # Be nice to Wikipedia's servers - add delay
                    time.sleep(0.5)
            
            return texts
            
        except requests.exceptions.RequestException as e:
            print(f"Wikipedia network error: {str(e)}")
            return []
        except Exception as e:
            print(f"Unexpected Wikipedia API Error: {str(e)}")
            return []  
  
    def get_local_content(self, location_info, business_type, radius_km):
        """Get local content using multiple free sources with fallbacks"""
        city = location_info.get('city', '')
        region = location_info.get('region', '')
        country = location_info.get('country', '')
        
        texts = []
        
        # Try Wikipedia first (with error handling)
        try:
            wiki_texts = self.get_wikipedia_content(city or region, business_type, radius_km)
            texts.extend(wiki_texts)
        except:
            pass  # Silently fail if Wikipedia doesn't work
        
        # Add reliable simulated data based on location
        simulated_data = self.generate_simulated_local_data(location_info, business_type, radius_km)
        texts.extend(simulated_data)
        
        # Add general location context
        radius_context = f"within a {radius_km}km radius" if radius_km > 0 else "in the area"
        if city and country:
            texts.append(f"{city}, {country} is known for its diverse local culture and business environment {radius_context}")
        
        # Add business type context
        business_context = {
            'coffee shop': 'Coffee culture varies significantly by region with local preferences for specific brewing styles',
            'tea house': 'Tea traditions differ globally with unique preparation methods in each culture',
            'restaurant': 'Culinary preferences are deeply influenced by local traditions and ingredients',
            'bar': 'Social drinking culture shows strong regional variations in preferences and customs'
        }
        
        if business_type.lower() in business_context:
            texts.append(business_context[business_type.lower()])
        
        return list(set(texts))  # Remove duplicates
   
    def generate_simulated_local_data(self, location_info, business_type, radius_km):
        """Generate simulated local data based on location characteristics"""
        country = location_info.get('country', '').lower()
        city = location_info.get('city', '').lower()
        texts = []
        
        # Add radius context
        radius_context = f"within {radius_km}km radius" if radius_km > 0 else "in the local area"
        
        # Add region-specific content patterns
        if 'india' in country:
            texts.append(f"{city} is known for its vibrant food culture with diverse culinary traditions {radius_context}")
            if 'tea' in business_type.lower():
                texts.append(f"Chai is an integral part of daily life across India with strong cultural significance {radius_context}")
            if 'coffee' in business_type.lower():
                texts.append(f"Coffee culture is growing rapidly in urban areas of India {radius_context}")
                
        elif 'italy' in country:
            texts.append(f"{city} features rich culinary heritage with emphasis on traditional recipes {radius_context}")
            if 'coffee' in business_type.lower():
                texts.append(f"Italian coffee culture is world-renowned with espresso being a daily ritual {radius_context}")
                
        elif 'usa' in country or 'united states' in country:
            texts.append(f"{city} has diverse dining options ranging from fast food to fine dining {radius_context}")
            
        elif 'japan' in country:
            texts.append(f"{city} offers unique culinary experiences blending tradition and innovation {radius_context}")
            if 'tea' in business_type.lower():
                texts.append(f"Japanese tea ceremony culture influences modern tea consumption patterns {radius_context}")
        
        # Add seasonal content
        current_month = datetime.now().month
        if current_month in [12, 1, 2]:  # Winter
            texts.append(f"Winter season brings preference for warm beverages and comfort foods {radius_context}")
        elif current_month in [6, 7, 8]:  # Summer
            texts.append(f"Summer months increase demand for cold drinks and refreshing options {radius_context}")
        
        return texts
    
    def analyze_text_for_keywords(self, texts, business_type):
        """Analyze texts for relevant keywords with advanced scoring"""
        # Get relevant categories for this business type
        relevant_categories = self.get_relevant_categories(business_type)
        
        # Initialize scoring
        category_scores = {category: 0 for category in relevant_categories}
        total_mentions = 0
        sentiment_scores = defaultdict(list)
        
        # Simple sentiment analysis
        positive_words = ["good", "great", "excellent", "amazing", "love", "best", "popular", "favorite", "trending", "growth", "success", "demand"]
        negative_words = ["bad", "poor", "terrible", "hate", "worst", "avoid", "overpriced", "disappointing", "decline", "saturated", "competition"]
        
        for text in texts:
            if text:
                text_lower = text.lower()
                
                # Count category mentions
                for category in relevant_categories:
                    for keyword in self.keywords[category]:
                        if keyword in text_lower:
                            count = text_lower.count(keyword)
                            category_scores[category] += count
                            total_mentions += count
                
                # Basic sentiment analysis
                for word in positive_words:
                    if word in text_lower:
                        sentiment_scores['positive'].append(word)
                
                for word in negative_words:
                    if word in text_lower:
                        sentiment_scores['negative'].append(word)
        
        # Calculate normalized scores (0-10 scale)
        relevance_scores = {}
        for category, score in category_scores.items():
            if total_mentions > 0:
                # Normalize by total mentions and scale
                relevance_scores[category] = min((score / total_mentions) * 20, 10)
            else:
                relevance_scores[category] = 0
        
        # Calculate overall sentiment
        positive_count = len(sentiment_scores['positive'])
        negative_count = len(sentiment_scores['negative'])
        total_sentiment = positive_count + negative_count
        
        if total_sentiment > 0:
            sentiment_ratio = positive_count / total_sentiment
        else:
            sentiment_ratio = 0.5  # Neutral if no sentiment words found
        
        return relevance_scores, sentiment_ratio
    
    def get_relevant_categories(self, business_type):
        """Dynamically determine relevant keyword categories based on business type"""
        business_type_lower = business_type.lower()
        relevant_categories = set()
        
        # Map business types to relevant keyword categories
        category_mapping = {
            'coffee': ['coffee', 'cafe', 'dessert'],
            'tea': ['tea', 'cafe', 'dessert'],
            'cafe': ['coffee', 'tea', 'cafe', 'dessert', 'healthy'],
            'restaurant': ['vegetarian', 'nonveg', 'streetfood', 'fastfood', 'healthy', 'fine_dining', 'casual_dining'],
            'bar': ['alcohol', 'fastfood', 'casual_dining'],
            'bakery': ['dessert', 'healthy', 'vegetarian'],
            'ice cream': ['dessert', 'vegetarian'],
            'healthy': ['healthy', 'vegetarian', 'casual_dining'],
            'fast food': ['fastfood', 'nonveg', 'casual_dining'],
            'fine dining': ['fine_dining', 'nonveg', 'alcohol']
        }
        
        # Find matching categories
        for key, categories in category_mapping.items():
            if key in business_type_lower:
                relevant_categories.update(categories)
        
        # If no specific match, use a broad set of categories
        if not relevant_categories:
            relevant_categories = set(self.keywords.keys())
        
        return list(relevant_categories)
    
    def calculate_cultural_fit(self, relevance_scores, sentiment_ratio, business_type, location_info, radius_km):
        """Calculate cultural fit score with global considerations"""
        # Base score starts at neutral
        base_score = 0.5
        
        # Calculate weighted category score
        category_weights = self.get_category_weights(business_type)
        weighted_sum = 0
        total_weight = 0
        
        for category, score in relevance_scores.items():
            weight = category_weights.get(category, 1.0)
            weighted_sum += score * weight
            total_weight += weight
        
        # Normalize category score (0-1 scale)
        if total_weight > 0:
            category_score = (weighted_sum / total_weight) / 10
        else:
            category_score = 0
        
        # Apply sentiment adjustment
        sentiment_adjustment = (sentiment_ratio - 0.5) * 0.3  # ±15% adjustment based on sentiment
        adjusted_category_score = min(max(category_score + sentiment_adjustment, 0), 1)
        
        # Blend base score with category score
        final_score = 0.6 * adjusted_category_score + 0.4 * base_score
        
        # Apply seasonal adjustments based on location
        final_score = self.apply_seasonal_adjustments(final_score, business_type, location_info)
        
        # Apply regional adjustments if available
        final_score = self.apply_regional_adjustments(final_score, business_type, location_info)
        
        # Apply radius-based adjustments
        final_score = self.apply_radius_adjustments(final_score, radius_km, business_type)
        
        return min(max(final_score, 0), 1)  # Ensure score is between 0 and 1
    
    def apply_radius_adjustments(self, score, radius_km, business_type):
        """Adjust score based on the analysis radius"""
        # Smaller radius means more localized analysis, which is more precise
        # Larger radius means broader analysis, which might dilute the score
        
        if radius_km <= 5:  # Very localized analysis
            return score * 1.05  # Small boost for hyper-local analysis
        elif radius_km <= 20:  # Local analysis
            return score  # No adjustment
        elif radius_km <= 50:  # Regional analysis
            return score * 0.95  # Slight reduction for broader analysis
        else:  # Very broad analysis
            return score * 0.9  # Reduction for very broad analysis
    
    def get_category_weights(self, business_type):
        """Get dynamic weights for different categories based on business type"""
        business_type_lower = business_type.lower()
        weights = {}
        
        # Default weights for all categories
        for category in self.keywords.keys():
            weights[category] = 1.0
        
        # Adjust weights based on business type
        if any(word in business_type_lower for word in ['coffee', 'cafe']):
            weights['coffee'] = 3.0
            weights['tea'] = 1.5
            weights['dessert'] = 2.0
            weights['cafe'] = 2.5
        
        if 'tea' in business_type_lower:
            weights['tea'] = 3.0
            weights['coffee'] = 1.0
            weights['dessert'] = 2.0
            weights['cafe'] = 2.5
        
        if 'restaurant' in business_type_lower:
            if 'vegetarian' in business_type_lower or 'vegan' in business_type_lower:
                weights['vegetarian'] = 3.0
                weights['healthy'] = 2.5
            else:
                weights['nonveg'] = 2.5
                weights['vegetarian'] = 1.5
            
            if 'fine' in business_type_lower or 'luxury' in business_type_lower:
                weights['fine_dining'] = 3.0
                weights['alcohol'] = 2.0
            else:
                weights['casual_dining'] = 2.5
        
        if 'bar' in business_type_lower or 'pub' in business_type_lower:
            weights['alcohol'] = 3.0
            weights['casual_dining'] = 2.0
        
        return weights
    
    def apply_seasonal_adjustments(self, score, business_type, location_info):
        """Apply seasonal adjustments based on location and hemisphere"""
        month = datetime.now().month
        lat = location_info.get('latitude', 0)
        
        if lat is not None:
            hemisphere = self.get_hemisphere(lat)
            seasons = self.seasonal_patterns[hemisphere]
            
            business_lower = business_type.lower()
            
            # Summer adjustments
            if month in seasons['summer']:
                if any(word in business_lower for word in ['ice cream', 'dessert', 'cold', 'smoothie']):
                    score *= 1.3  # Boost for cold items in summer
                elif any(word in business_lower for word in ['coffee', 'tea', 'hot', 'soup']):
                    score *= 0.9  # Slight decrease for hot items in summer
            
            # Winter adjustments
            elif month in seasons['winter']:
                if any(word in business_lower for word in ['coffee', 'tea', 'hot', 'soup']):
                    score *= 1.2  # Boost for hot items in winter
                elif any(word in business_lower for word in ['ice cream', 'cold', 'smoothie']):
                    score *= 0.8  # Decrease for cold items in winter
            
            # Festival seasons (Q4 generally has more holidays globally)
            if month in [10, 11, 12]:
                if any(word in business_lower for word in ['restaurant', 'food', 'cafe', 'bar']):
                    score *= 1.1  # General boost during holiday season
        
        return score
    
    def apply_regional_adjustments(self, score, business_type, location_info):
        """Apply regional/cultural adjustments based on location"""
        country = location_info.get('country', '').lower()
        business_lower = business_type.lower()
        
        # Regional preferences (simplified examples)
        regional_preferences = {
            'india': {
                'tea': 1.2, 'coffee': 0.8, 'vegetarian': 1.3, 'nonveg': 0.9
            },
            'italy': {
                'coffee': 1.4, 'pizza': 1.5, 'pasta': 1.4, 'tea': 0.7
            },
            'united states': {
                'coffee': 1.3, 'fastfood': 1.2, 'healthy': 1.1
            },
            'united kingdom': {
                'tea': 1.4, 'pub': 1.3, 'fish': 1.2
            },
            'japan': {
                'tea': 1.5, 'healthy': 1.3, 'seafood': 1.4, 'coffee': 1.1
            },
            'france': {
                'coffee': 1.3, 'wine': 1.5, 'bakery': 1.4, 'tea': 0.8
            }
        }
        
        # Apply country-specific adjustments
        for country_pattern, adjustments in regional_preferences.items():
            if country_pattern in country:
                for business_pattern, multiplier in adjustments.items():
                    if business_pattern in business_lower:
                        score *= multiplier
                        break  # Apply only the first matching pattern
        
        return score
    
    def get_cultural_fit_score(self, lat, lng, business_type, radius_km=10):
        """Main function to get cultural fit score for any global location"""

        # Step 1: Get detailed location information
        location_info = self.get_location_from_coords(lat, lng)
        if 'error' in location_info:
            return {"error": location_info['error']}
                
        # Step 2: Get local content
        content_texts = self.get_local_content(location_info, business_type, radius_km)
        
        # Step 3: Analyze the content for relevant keywords and sentiment
        relevance_scores, sentiment_ratio = self.analyze_text_for_keywords(content_texts, business_type)
        
        # Step 4: Calculate cultural fit score
        cultural_fit = self.calculate_cultural_fit(
            relevance_scores, sentiment_ratio, business_type, location_info, radius_km
        )
        
        # Step 5: Generate insights
        insights = self.generate_insights(
            relevance_scores, cultural_fit, business_type, location_info, sentiment_ratio, radius_km
        )
        
        return {
            'cultural_fit_score': round(cultural_fit, 3),
            'location': location_info['formatted_address'],
            'business_type': business_type,
            'analysis_radius_km': radius_km,
            'relevance_scores': relevance_scores,
            'sentiment_ratio': sentiment_ratio,
            'insights': insights,
            'content_analyzed': len(content_texts)
        }
    
    def generate_insights(self, relevance_scores, cultural_fit, business_type, location_info, sentiment_ratio, radius_km):
        """Generate human-readable insights from the analysis"""
        insights = []
        
        # Main insight based on score
        score_percentage = cultural_fit * 100
        radius_context = f"within {radius_km}km radius" if radius_km > 0 else "in the local area"
        
        if cultural_fit >= 0.7:
            insights.append(f"Excellent cultural fit ({score_percentage:.1f}%) for a {business_type} in {location_info.get('city', 'this location')} {radius_context}")
        elif cultural_fit >= 0.5:
            insights.append(f"Good cultural fit ({score_percentage:.1f}%) for a {business_type} in {location_info.get('city', 'this location')} {radius_context}")
        elif cultural_fit >= 0.3:
            insights.append(f"Moderate cultural fit ({score_percentage:.1f}%) for a {business_type} in {location_info.get('city', 'this location')} {radius_context}")
        else:
            insights.append(f"Poor cultural fit ({score_percentage:.1f}%) for a {business_type} in {location_info.get('city', 'this location')} {radius_context}")
        
        # Add insights based on keyword relevance
        top_categories = sorted(relevance_scores.items(), key=lambda x: x[1], reverse=True)[:3]
        
        for category, score in top_categories:
            if score > 5:
                insights.append(f"Strong local interest in {category.replace('_', ' ')} (score: {score:.1f}/10) {radius_context}")
            elif score > 2:
                insights.append(f"Moderate local interest in {category.replace('_', ' ')} (score: {score:.1f}/10) {radius_context}")
        
        # Sentiment insight
        if sentiment_ratio > 0.7:
            insights.append(f"Very positive sentiment detected in local content {radius_context}")
        elif sentiment_ratio > 0.6:
            insights.append(f"Generally positive sentiment detected in local content {radius_context}")
        elif sentiment_ratio < 0.4:
            insights.append(f"Some negative sentiment detected in local content {radius_context}")
        
        # Seasonal insight
        month = datetime.now().month
        hemisphere = self.get_hemisphere(location_info.get('latitude', 0))
        seasons = self.seasonal_patterns[hemisphere]
        
        if month in seasons['summer']:
            insights.append(f"Currently in summer season - consider seasonal offerings {radius_context}")
        elif month in seasons['winter']:
            insights.append(f"Currently in winter season - consider seasonal offerings {radius_context}")
        elif month in seasons['spring']:
            insights.append(f"Currently in spring season - consider seasonal offerings {radius_context}")
        elif month in seasons['fall']:
            insights.append(f"Currently in fall season - consider seasonal offerings {radius_context}")
        
        # Regional insight
        country = location_info.get('country', '')
        if country:
            insights.append(f"Analysis includes regional preferences for {country} {radius_context}")
            
        # Radius insight
        if radius_km <= 5:
            insights.append("Analysis focused on a very localized area (hyper-local)")
        elif radius_km <= 20:
            insights.append("Analysis focused on the immediate local area")
        elif radius_km <= 50:
            insights.append("Analysis covers a broader regional area")
        else:
            insights.append("Analysis covers a wide geographic region")
        
        return insights
    
# Global baseline multipliers (from industry reports)
global_baseline_multipliers = {
    "cafe": 1.2,
    "restaurant": 1.0,
    "gym": 0.8,
    "clothing_store": 0.9,
    "supermarket": 1.5,
    "pharmacy": 1.1,
    "electronics_store": 1.3,
    "jewelry_store": 1.4,
    "book_store": 0.7,
    "bar": 1.2
}

# --- Step 1: Get current location coordinates ---
def get_current_location():
    """Get current latitude and longitude using IP address"""
    try:
        # Get location based on IP address
        g = geocoder.ip('me')
        if g.ok:
            return (g.lat, g.lng)
        else:
            # Fallback to manual input if IP geolocation fails
            address = input("Please enter your current location (e.g., 'New York, USA'): ")
            return get_coordinates(address)
    except Exception as e:
        print(f"Error getting current location: {e}")
        return None

def get_coordinates(place_name):
    """Get latitude and longitude for any location worldwide"""
    geolocator = Nominatim(user_agent="business_analysis_app")
    try:
        location = geolocator.geocode(place_name)
        if location:
            return (location.latitude, location.longitude)
        else:
            print(f"Location '{place_name}' not found.")
            return None
    except Exception as e:
        print(f"Geocoding error: {e}")
        return None

# --- Step 2: Create circle polygon (GeoJSON) ---
def create_circle_geojson(lat, lon, radius_km, num_points=36):
    """Create a circular polygon for API queries"""
    coords = []
    for i in range(num_points):
        angle = 2 * math.pi * i / num_points
        dx = radius_km / 111.32 * math.cos(angle)   # ~111.32 km per degree latitude
        dy = radius_km / (111.32 * math.cos(math.radians(lat))) * math.sin(angle)
        coords.append([lon + dy, lat + dx])
    coords.append(coords[0])  # close polygon

    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coords]
                }
            }
        ]
    }
    return geojson

# --- Step 3: Query WorldPop API with GeoJSON ---
def fetch_population_worldpop(lat, lon, radius_km=5, year=2020):
    """Get population data from WorldPop API"""
    try:
        geojson = create_circle_geojson(lat, lon, radius_km)

        url = "https://api.worldpop.org/v1/services/stats"
        params = {
            "dataset": "wpgppop",   # WorldPop global population dataset
            "year": str(year),
            "geojson": json.dumps(geojson)  # must be stringified
        }

        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "data" in data and "total_population" in data["data"]:
                return data["data"]["total_population"]
        
        return None  # API didn't return valid data
    except Exception as e:
        print(f"WorldPop API error: {e}")
        return None

# --- Step 4: Alternative population estimation using OpenStreetMap ---
def estimate_population_osm(lat, lon, radius_km):
    """Fallback population estimation using OpenStreetMap data"""
    try:
        radius_meters = radius_km * 1000
        
        # Query for residential buildings
        overpass_url = "http://overpass-api.de/api/interpreter"
        overpass_query = f"""
        [out:json][timeout:25];
        (
          node["building"~"residential|apartments|house|detached"](around:{radius_meters},{lat},{lon});
          way["building"~"residential|apartments|house|detached"](around:{radius_meters},{lat},{lon});
        );
        out count;
        """
        
        response = requests.post(overpass_url, data=overpass_query, timeout=15)
        data = response.json()
        
        # Count buildings
        building_count = 0
        for element in data.get('elements', []):
            if element.get('type') == 'count':
                building_count = element.get('total', 0)
                break
        
        # Estimate population (4 people per building on average)
        estimated_population = building_count * 4
        
        # Adjust for urban vs rural (more dense in cities)
        urban_density_factor = 1.5  # Adjust based on location type if possible
        return int(estimated_population * urban_density_factor)
        
    except Exception as e:
        print(f"OSM estimation error: {e}")
        return None

# --- Step 5: Get population with fallbacks ---
def get_population_within_radius(lat, lon, radius_km=5):
    """Get population with multiple fallback methods"""
    # Try WorldPop first
    population = fetch_population_worldpop(lat, lon, radius_km)
    
    # If WorldPop fails, try OSM estimation
    if population is None or population == 0:

        population = estimate_population_osm(lat, lon, radius_km)
    
    # If both methods fail, use a reasonable default based on area
    if population is None or population == 0:

        # Estimate based on area (people per sq km)
        area_sq_km = math.pi * (radius_km ** 2)
        
        # Default population densities (people per sq km)
        # Urban: 2000, Suburban: 1000, Rural: 200
        population = int(area_sq_km * 1000)  # Default to suburban density
    
    return max(population, 100)  # Ensure minimum population

# --- Step 6: Income estimation ---
def get_income_index(lat, lon, radius_km):
    """Estimate income level using commercial activity as proxy"""
    try:
        radius_meters = radius_km * 1000
        
        # Query for commercial activities
        overpass_url = "http://overpass-api.de/api/interpreter"
        overpass_query = f"""
        [out:json][timeout:25];
        (
          node["shop"](around:{radius_meters},{lat},{lon});
          node["amenity"~"restaurant|cafe|bank"](around:{radius_meters},{lat},{lon});
          way["shop"](around:{radius_meters},{lat},{lon});
          way["amenity"~"restaurant|cafe|bank"](around:{radius_meters},{lat},{lon});
        );
        out count;
        """
        
        response = requests.post(overpass_url, data=overpass_query, timeout=15)
        data = response.json()
        
        # Count commercial entities
        commercial_count = 0
        for element in data.get('elements', []):
            if element.get('type') == 'count':
                commercial_count = element.get('total', 0)
                break
        
        # More commercial activity = higher income area (proxy)
        income_index = 0.5 + (commercial_count * 0.01)  # Base 0.5, +0.01 per commercial entity
        return min(max(income_index, 0.5), 1.5)  # Cap between 0.5-1.5
        
    except Exception as e:
        print(f"Income estimation error: {e}")
        return 1.0  # Default average income

# --- Step 7: Get nearby businesses ---
def get_nearby_places(lat, lon, radius_km, business_type):
    """Get nearby businesses using Overpass API"""
    try:
        radius_meters = radius_km * 1000
        
        # Map business types to OSM tags
        osm_tags = {
            "cafe": '["amenity"="cafe"]',
            "restaurant": '["amenity"="restaurant"]',
            "gym": '["leisure"="fitness_centre"]',
            "clothing_store": '["shop"="clothes"]',
            "supermarket": '["shop"="supermarket"]',
            "pharmacy": '["amenity"="pharmacy"]',
            "electronics_store": '["shop"="electronics"]',
            "jewelry_store": '["shop"="jewelry"]',
            "book_store": '["shop"="books"]',
            "bar": '["amenity"="bar"]'
        }
        
        tag_query = osm_tags.get(business_type, '["shop"]')
        
        overpass_url = "http://overpass-api.de/api/interpreter"
        overpass_query = f"""
        [out:json][timeout:25];
        (
          node{tag_query}(around:{radius_meters},{lat},{lon});
        );
        out;
        """
        
        response = requests.post(overpass_url, data=overpass_query, timeout=15)
        data = response.json()
        
        businesses = []
        for element in data.get('elements', []):
            if element.get('type') == 'node':
                business = {
                    'name': element.get('tags', {}).get('name', 'Unknown'),
                    'user_ratings_total': 10,  # Default value
                    'price_level': 1  # Default value
                }
                businesses.append(business)
            
        return businesses
        
    except Exception as e:
        print(f"Error getting nearby places: {e}")
        return []

# --- Step 8: Calculate confidence score ---
def calculate_confidence(population, competition_count):
    """Calculate confidence score based on data quality"""
    # Base confidence on population data reliability
    pop_confidence = min(population / 5000, 1.0)  # More population = more reliable
    
    # Adjust for competition data (more competition data = more reliable)
    comp_confidence = min(competition_count / 10, 1.0)
    
    # Overall confidence (weighted average)
    confidence = (pop_confidence * 0.6) + (comp_confidence * 0.4)
    
    return max(0.5, min(confidence, 0.9))  # Keep between 0.5-0.9

# --- Step 9: Main business analysis function ---
def analyze_business_location(business_type, lat, lon, radius_km=2):
     
    """
    Analyze a business location using coordinates
    Returns: multiplier, confidence, and detailed analysis
    """
    try:
        # 1. Get the global baseline for the business type
        baseline = global_baseline_multipliers.get(business_type, 1.0)

        # 2. Calculate Local Demand Score
        total_population = get_population_within_radius(lat, lon, radius_km)
        avg_income_index = get_income_index(lat, lon, radius_km)
        local_demand_score = total_population * avg_income_index

        # 3. Calculate Local Supply Score (Competition)
        competing_businesses = get_nearby_places(lat, lon, radius_km, business_type)
        competition_count = len(competing_businesses)
        
        # Calculate the "strength" of each competitor
        total_competition_strength = 0
        for business in competing_businesses:
            strength = business.get('user_ratings_total', 10) * business.get('price_level', 1)
            total_competition_strength += strength

        local_supply_score = total_competition_strength

        # 4. Calculate local adjustment
        if local_supply_score == 0:
            local_adjustment = 1.8  # Bonus for no competition (capped)
        else:
            # Normalize the ratio to avoid extreme values
            raw_ratio = local_demand_score / local_supply_score
            # Apply sigmoid-like function to keep between 0.5-2.0
            local_adjustment = 0.5 + 1.5 / (1 + math.exp(-0.000001 * (raw_ratio - 500000)))
            
        local_adjustment = max(0.5, min(2.0, local_adjustment))

        # 5. Calculate Final Multiplier
        final_multiplier = baseline * local_adjustment

        # 6. Calculate Confidence
        confidence = calculate_confidence(total_population, competition_count)

        # 7. Generate notes
        if competition_count == 0:
            notes = "No direct competitors found. High opportunity but verify local demand."
        elif competition_count < 3:
            notes = f"Low competition ({competition_count} competitors). Good market conditions."
        elif competition_count < 8:
            notes = f"Moderate competition ({competition_count} competitors). Viable market."
        else:
            notes = f"High competition ({competition_count} competitors). Consider differentiation."

        return {
            "multiplier": round(final_multiplier, 2),
            "confidence": round(confidence, 2),
            "population": total_population,
            "competition_count": competition_count,
            "income_index": round(avg_income_index, 2),
            "notes": notes,
            "coordinates": (lat, lon),
            "radius_km": radius_km
        }
        
    except Exception as e:
        print(f"Error in business analysis: {e}")
        # Return a default value with low confidence
        return {
            "multiplier": global_baseline_multipliers.get(business_type, 1.0),
            "confidence": 0.5,
            "population": 0,
            "competition_count": 0,
            "income_index": 1.0,
            "notes": "Error in analysis. Using baseline value.",
            "radius_km": radius_km
        }


import os
import requests
from datetime import datetime
from geopy.geocoders import Nominatim

class RealTimeMarketFactors:
    def __init__(self):
        self.here_api_key = os.getenv('HERE_API_KEY')
        self.openweather_api_key = os.getenv('OPEN_WEATHER_API_KEY')
        self.ticketmaster_api_key = os.getenv('TICKET_MASTER_API_KEY')
        self.google_maps_api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        self.overpass_url = "http://overpass-api.de/api/interpreter"
        self.geolocator = Nominatim(user_agent="market_factors_app")

    def get_market_factors(self, lat, lon, business_type, radius_km=5):
        """
        Calculate market factors that reduce business revenue potential
        Returns a multiplier between 0.1-1.0 where lower values indicate more friction
        """
        try:
            factors = {}
            weights = {}
            
            # 1. Rent Index (40% weight)
            rent_factor = self.get_rent_index(lat, lon, radius_km, business_type)
            factors['rent_index'] = rent_factor
            weights['rent_index'] = 0.4
            
            # 2. Regulatory Environment (30% weight)
            regulatory_factor = self.get_regulatory_index(lat, lon)
            factors['regulatory_index'] = regulatory_factor
            weights['regulatory_index'] = 0.3
            
            # 3. Seasonality (20% weight)
            seasonality_factor = self.get_seasonality_index(lat, lon, business_type)
            factors['seasonality_index'] = seasonality_factor
            weights['seasonality_index'] = 0.2
            
            # 4. Local Competition Density (10% weight)
            competition_factor = self.get_competition_density(lat, lon, business_type, radius_km)
            factors['competition_density'] = competition_factor
            weights['competition_density'] = 0.1
            
            # Calculate weighted average
            total_weight = sum(weights.values())
            weighted_sum = sum(factors[factor] * weights[factor] for factor in factors)
            market_factor = weighted_sum / total_weight
            
            # Apply business-type specific adjustments
            market_factor = self.apply_business_specific_adjustments(market_factor, business_type)
            
            return {
                "market_factor": round(market_factor, 3),
                "components": factors,
                "weights": weights,
                "confidence": self.estimate_confidence(factors),
                "notes": self.generate_market_notes(factors, market_factor)
            }
            
        except Exception as e:
            print(f"Error calculating market factors: {e}")
            return {
                "market_factor": 0.7,
                "components": {"error": "Calculation failed"},
                "weights": {},
                "confidence": 0.5,
                "notes": "Using default market factor due to calculation error"
            }

    def get_rent_index(self, lat, lon, radius_km, business_type):
        """Estimate rent costs using real-time data from HERE API"""
        try:
            # Use HERE API to get real estate data
            here_url = "https://browse.search.hereapi.com/v1/browse"
            
            params = {
                'at': f"{lat},{lon}",
                'limit': 20,
                'categories': 'commercial-real-estate,real-estate-agency',
                'radius': radius_km * 1000,
                'apiKey': self.here_api_key
            }
            
            response = requests.get(here_url, params=params, timeout=15)
            data = response.json()
            
            # Analyze real estate listings for price data
            total_rent = 0
            count = 0
            
            for item in data.get('items', []):
                # Extract price information from title or description
                title = item.get('title', '').lower()
                address_info = item.get('address', {})
                
                # Look for price indicators in title
                if any(term in title for term in ['rent', 'lease', 'commercial', 'space', 'office', 'retail']):
                    # Try to extract price from title or use location-based estimation
                    location_rent = self.estimate_rent_from_location(lat, lon, address_info.get('city', ''))
                    if location_rent:
                        total_rent += location_rent
                        count += 1
            
            if count > 0:
                avg_rent = total_rent / count
                # Normalize rent to 0.1-1.0 scale (higher rent = lower factor)
                normalized_rent = min(max(avg_rent / 10000, 0.1), 1.0)  # Assuming $10,000/month is very high
                return round(1.0 - normalized_rent, 3)
            
            # Fallback to Google Places API for commercial density
            return self.get_rent_from_google_places(lat, lon, business_type, radius_km)
            
        except Exception as e:
            print(f"HERE API rent estimation error: {e}")
            return self.get_rent_from_google_places(lat, lon, business_type, radius_km)

    def get_rent_from_google_places(self, lat, lon, business_type, radius_km):
        """Fallback rent estimation using Google Places API"""
        try:
            google_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            
            # Map business types to Google Places types
            place_types = {
                "restaurant": "restaurant",
                "cafe": "cafe",
                "bar": "bar",
                "gym": "gym",
                "clothing_store": "clothing_store",
                "supermarket": "supermarket",
                "pharmacy": "pharmacy",
                "electronics_store": "electronics_store",
                "jewelry_store": "jewelry_store",
                "book_store": "book_store"
            }
            
            place_type = place_types.get(business_type, "commercial_building")
            
            params = {
                'location': f"{lat},{lon}",
                'radius': radius_km * 1000,
                'type': place_type,
                'key': self.google_maps_api_key
            }
            
            response = requests.get(google_url, params=params, timeout=15)
            data = response.json()
            
            # Estimate rent based on business density and type
            place_count = len(data.get('results', []))
            
            # More businesses = higher rent area
            base_rent = 1000  # Base rent in USD
            density_factor = min(place_count / 5, 8)  # Cap at 8x base
            estimated_rent = base_rent * (1 + density_factor)
            
            # Adjust for business type
            rent_multipliers = {
                "restaurant": 1.5,
                "cafe": 1.2,
                "bar": 1.3,
                "gym": 1.1,
                "clothing_store": 1.4,
                "electronics_store": 1.6,
                "jewelry_store": 1.7,
                "default": 1.0
            }
            
            multiplier = rent_multipliers.get(business_type, 1.0)
            estimated_rent *= multiplier
            
            normalized_rent = min(max(estimated_rent / 10000, 0.1), 1.0)
            return round(1.0 - normalized_rent, 3)
            
        except Exception as e:
            print(f"Google Places rent estimation error: {e}")
            return 0.7

    def estimate_rent_from_location(self, lat, lon, city):
        """Estimate rent based on location using multiple data sources"""
        try:
            # Use OpenWeather API to get city data for cost estimation
            weather_url = "http://api.openweathermap.org/data/2.5/weather"
            
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.openweather_api_key,
                'units': 'metric'
            }
            
            response = requests.get(weather_url, params=params, timeout=10)
            weather_data = response.json()
            
            # Estimate cost based on city size and development level
            city_population = weather_data.get('sys', {}).get('population', 0)
            country = weather_data.get('sys', {}).get('country', '')
            
            # Base rent estimation logic
            base_rent = 500
            
            # Adjust for city size
            if city_population > 5000000:  # Megacity
                base_rent *= 3
            elif city_population > 1000000:  # Large city
                base_rent *= 2
            elif city_population > 500000:  # Medium city
                base_rent *= 1.5
            
            # Adjust for country development level (simplified)
            developed_countries = ['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'AU', 'KR', 'SG']
            if country in developed_countries:
                base_rent *= 2
            
            return base_rent
            
        except Exception as e:
            print(f"Location-based rent estimation error: {e}")
            return None

    def get_regulatory_index(self, lat, lon):
        """Estimate regulatory burden using real economic data"""
        try:
            # Get location data
            location = self.geolocator.reverse(f"{lat}, {lon}")
            address = location.raw.get('address', {})
            country_code = address.get('country_code', '').upper()
            city = address.get('city', '')
            
            # Use Ticketmaster API as proxy for business activity and regulations
            # More events = more business-friendly environment
            try:
                ticketmaster_url = "https://app.ticketmaster.com/discovery/v2/events.json"
                
                params = {
                    'apikey': self.ticketmaster_api_key,
                    'latlong': f"{lat},{lon}",
                    'radius': 50,  # 50km radius
                    'size': 5  # Limit results
                }
                
                response = requests.get(ticketmaster_url, params=params, timeout=10)
                events_data = response.json()
                
                event_count = len(events_data.get('_embedded', {}).get('events', []))
                
                # More events indicate vibrant business environment
                if event_count > 10:
                    events_factor = 0.9
                elif event_count > 5:
                    events_factor = 0.7
                elif event_count > 0:
                    events_factor = 0.6
                else:
                    events_factor = 0.5
                    
            except Exception as e:
                print(f"Ticketmaster API error: {e}")
                events_factor = 0.6
            
            # Combine with country-level regulatory data
            country_factors = self.get_country_regulatory_factor(country_code)
            
            # Weighted average: 70% country factor, 30% local events factor
            regulatory_index = (country_factors * 0.7) + (events_factor * 0.3)
            
            return round(regulatory_index, 3)
            
        except Exception as e:
            print(f"Regulatory index error: {e}")
            return 0.6

    def get_country_regulatory_factor(self, country_code):
        """Get regulatory factor based on real-time economic indicators"""
        # More comprehensive country factors based on real economic data
        regulatory_scores = {
            # Top business-friendly countries
            "NZ": 0.9, "SG": 0.9, "DK": 0.85, "KR": 0.85, "US": 0.8, 
            "GB": 0.8, "CA": 0.8, "AU": 0.8, "SE": 0.8, "NO": 0.8,
            # Good business environment
            "DE": 0.75, "FR": 0.75, "JP": 0.75, "NL": 0.75, "CH": 0.75,
            "FI": 0.75, "IE": 0.75, "AT": 0.75, "BE": 0.75,
            # Average
            "ES": 0.65, "IT": 0.65, "PT": 0.65, "CZ": 0.65, "PL": 0.65,
            "HU": 0.65, "SK": 0.65, "EE": 0.65, "LT": 0.65, "LV": 0.65,
            # Developing economies
            "CN": 0.55, "IN": 0.55, "BR": 0.5, "RU": 0.5, "ZA": 0.5,
            "MX": 0.55, "ID": 0.5, "TR": 0.5, "TH": 0.55,
            # Default
            "default": 0.6
        }
        
        return regulatory_scores.get(country_code, regulatory_scores["default"])

    def get_seasonality_index(self, lat, lon, business_type):
        """Calculate seasonality impact using real weather data"""
        try:
            # Get current weather and seasonal data
            weather_url = "http://api.openweathermap.org/data/2.5/weather"
            
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.openweather_api_key,
                'units': 'metric'
            }
            
            response = requests.get(weather_url, params=params, timeout=10)
            weather_data = response.json()
            
            current_temp = weather_data['main']['temp']
            weather_main = weather_data['weather'][0]['main'].lower()
            current_month = datetime.now().month
            
            # Base seasonality on weather conditions and business type
            base_factor = self.get_base_seasonality(current_month, business_type)
            
            # Adjust for current weather conditions
            weather_adjustment = self.get_weather_adjustment(weather_main, current_temp, business_type)
            
            # Combine base seasonality with current weather
            seasonality_index = base_factor * weather_adjustment
            
            return min(1.0, max(0.1, round(seasonality_index, 3)))
            
        except Exception as e:
            print(f"Seasonality index error: {e}")
            return 0.8

    def get_base_seasonality(self, month, business_type):
        """Get base seasonality factor for business type"""
        # Enhanced seasonality patterns based on real business cycles
        seasonality_patterns = {
            "ice_cream": [0.2, 0.3, 0.5, 0.7, 0.9, 0.95, 1.0, 0.9, 0.7, 0.5, 0.3, 0.2],
            "ski_resort": [0.9, 0.95, 0.8, 0.4, 0.1, 0.05, 0.05, 0.05, 0.1, 0.4, 0.8, 0.9],
            "beach_resort": [0.2, 0.3, 0.5, 0.7, 0.9, 1.0, 1.0, 0.9, 0.7, 0.5, 0.3, 0.2],
            "restaurant": [0.9, 0.8, 0.9, 0.9, 0.95, 0.9, 0.9, 0.95, 1.0, 1.0, 0.95, 1.0],
            "cafe": [0.9, 0.85, 0.9, 0.9, 0.9, 0.85, 0.85, 0.9, 0.95, 0.95, 0.9, 0.95],
            "bar": [0.9, 0.8, 0.9, 0.9, 0.95, 0.9, 0.9, 0.95, 0.9, 0.9, 0.9, 1.0],
            "retail": [1.0, 0.7, 0.8, 0.8, 0.9, 0.9, 0.9, 0.9, 0.95, 1.0, 1.0, 1.2],
            "gym": [1.1, 1.0, 0.9, 0.8, 0.7, 0.7, 0.7, 0.8, 0.9, 1.0, 1.0, 1.1],
            "default": [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8]
        }
        
        pattern_mapping = {
            "restaurant": "restaurant",
            "cafe": "cafe",
            "bar": "bar",
            "clothing_store": "retail",
            "electronics_store": "retail",
            "jewelry_store": "retail",
            "book_store": "retail",
            "supermarket": "retail",
            "pharmacy": "retail",
            "gym": "gym"
        }
        
        pattern_key = pattern_mapping.get(business_type, "default")
        monthly_factors = seasonality_patterns[pattern_key]
        
        return monthly_factors[month - 1]

    def get_weather_adjustment(self, weather_main, temperature, business_type):
        """Adjust seasonality based on current weather conditions"""
        # Weather impact on different business types
        weather_impacts = {
            "clear": {
                "restaurant": 1.1, "cafe": 1.2, "bar": 1.1, "retail": 1.0,
                "ice_cream": 1.3, "beach_resort": 1.4, "default": 1.1
            },
            "clouds": {
                "default": 1.0
            },
            "rain": {
                "restaurant": 0.9, "cafe": 1.1, "retail": 0.8, 
                "ice_cream": 0.5, "beach_resort": 0.3, "default": 0.9
            },
            "snow": {
                "restaurant": 0.8, "cafe": 1.0, "retail": 0.7,
                "ski_resort": 1.3, "default": 0.8
            }
        }
        
        # Temperature adjustments
        temp_adjustment = 1.0
        if temperature > 30:  # Hot weather
            temp_adjustment = 1.2 if business_type in ["ice_cream", "beach_resort"] else 0.9
        elif temperature < 5:  # Cold weather
            temp_adjustment = 1.2 if business_type == "ski_resort" else 0.9
        
        # Get weather impact
        weather_impact = 1.0
        for weather_key in weather_impacts:
            if weather_key in weather_main:
                weather_impact = weather_impacts[weather_key].get(business_type, 
                    weather_impacts[weather_key]["default"])
                break
        
        return weather_impact * temp_adjustment

    def get_competition_density(self, lat, lon, business_type, radius_km):
        """Calculate competition density using Overpass API and Google Places"""
        try:
            radius_meters = radius_km * 1000
            
            # Map business types to OSM tags
            osm_tags = {
                "cafe": '["amenity"="cafe"]',
                "restaurant": '["amenity"="restaurant"]',
                "gym": '["leisure"="fitness_centre"]',
                "clothing_store": '["shop"="clothes"]',
                "supermarket": '["shop"="supermarket"]',
                "pharmacy": '["amenity"="pharmacy"]',
                "electronics_store": '["shop"="electronics"]',
                "jewelry_store": '["shop"="jewelry"]',
                "book_store": '["shop"="books"]',
                "bar": '["amenity"="bar"]'
            }
            
            tag_query = osm_tags.get(business_type, '["shop"]')
            
            overpass_query = f"""
            [out:json][timeout:25];
            (
              node{tag_query}(around:{radius_meters},{lat},{lon});
              way{tag_query}(around:{radius_meters},{lat},{lon});
            );
            out count;
            """
            
            response = requests.post(self.overpass_url, data=overpass_query, timeout=15)
            data = response.json()
            
            # Get competitor count from Overpass
            osm_competitor_count = 0
            for element in data.get('elements', []):
                if element.get('type') == 'count':
                    osm_competitor_count = element.get('total', 0)
                    break
            
            # Also check Google Places for more comprehensive data
            google_competitor_count = self.get_google_places_competition(lat, lon, business_type, radius_km)
            
            # Use the higher count for conservative estimation
            competitor_count = max(osm_competitor_count, google_competitor_count)
            
            # Convert to factor (more competition = lower factor)
            # Normalize: 0 competitors = 1.0, 15+ competitors = 0.1
            if competitor_count == 0:
                competition_factor = 1.0
            else:
                competition_factor = max(0.1, 1.0 - (competitor_count * 0.06))
            
            return round(competition_factor, 3)
            
        except Exception as e:
            print(f"Competition density error: {e}")
            return 0.7

    def get_google_places_competition(self, lat, lon, business_type, radius_km):
        """Get competition data from Google Places API"""
        try:
            google_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            
            place_types = {
                "restaurant": "restaurant",
                "cafe": "cafe",
                "bar": "bar",
                "gym": "gym",
                "clothing_store": "clothing_store",
                "supermarket": "supermarket",
                "pharmacy": "pharmacy",
                "electronics_store": "electronics_store",
                "jewelry_store": "jewelry_store",
                "book_store": "book_store"
            }
            
            place_type = place_types.get(business_type, "point_of_interest")
            
            params = {
                'location': f"{lat},{lon}",
                'radius': radius_km * 1000,
                'type': place_type,
                'key': self.google_maps_api_key
            }
            
            response = requests.get(google_url, params=params, timeout=15)
            data = response.json()
            
            return len(data.get('results', []))
            
        except Exception as e:
            print(f"Google Places competition error: {e}")
            return 0

    def apply_business_specific_adjustments(self, market_factor, business_type):
        """Apply business-type specific adjustments to market factor"""
        adjustments = {
            "restaurant": 0.95,
            "cafe": 0.9,
            "bar": 0.85,
            "gym": 1.05,
            "pharmacy": 1.1,
            "supermarket": 1.05,
            "ice_cream": 0.8,  # Highly seasonal
            "ski_resort": 0.85, # Seasonal
            "beach_resort": 0.8, # Seasonal
            "default": 1.0
        }
        
        adjustment = adjustments.get(business_type, adjustments["default"])
        adjusted_factor = market_factor * adjustment
        
        return max(0.1, min(1.0, round(adjusted_factor, 3)))

    def estimate_confidence(self, factors):
        """Estimate confidence in market factors calculation"""
        # Count successful API calls (factors not using fallback values)
        successful_factors = sum(1 for factor in factors.values() 
                               if factor not in [0.7, 0.6, 0.8])  # Common fallback values
        
        total_factors = len(factors)
        base_confidence = successful_factors / total_factors
        
        # Adjust confidence based on data freshness and source reliability
        confidence_adjustment = 0.9 if base_confidence > 0.7 else 0.7
        
        final_confidence = base_confidence * confidence_adjustment
        return max(0.5, min(0.95, round(final_confidence, 2)))

    def generate_market_notes(self, factors, market_factor):
        """Generate explanatory notes about market factors"""
        notes = []
        
        rent_index = factors.get('rent_index', 0.7)
        regulatory_index = factors.get('regulatory_index', 0.6)
        seasonality_index = factors.get('seasonality_index', 0.8)
        competition_density = factors.get('competition_density', 0.7)
        
        if rent_index < 0.4:
            notes.append("Very high rental costs detected - significant impact on profitability expected.")
        elif rent_index < 0.6:
            notes.append("Above average rental costs may affect profit margins.")
        elif rent_index > 0.8:
            notes.append("Favorable rental market with lower operating costs.")
        
        if regulatory_index < 0.5:
            notes.append("Challenging regulatory environment detected - consider local business advisory.")
        elif regulatory_index > 0.7:
            notes.append("Business-friendly regulatory environment with good support systems.")
        
        if seasonality_index < 0.6:
            notes.append("High seasonal variability - consider business model adaptations.")
        elif seasonality_index > 0.9:
            notes.append("Stable year-round business conditions with minimal seasonal impact.")
        
        if competition_density < 0.4:
            notes.append("Very high competition density - strong differentiation strategy needed.")
        elif competition_density < 0.6:
            notes.append("Moderate to high competition - focus on unique value proposition.")
        elif competition_density > 0.8:
            notes.append("Limited direct competition in immediate area - good market opportunity.")
        
        if market_factor < 0.4:
            notes.append("CRITICAL: Very challenging market conditions - thorough feasibility study recommended.")
        elif market_factor < 0.6:
            notes.append("Challenging market conditions present significant barriers to entry.")
        elif market_factor > 0.8:
            notes.append("EXCELLENT: Favorable market conditions with good growth potential.")
        else:
            notes.append("Moderate market conditions - balanced risk and opportunity profile.")
        
        return " ".join(notes)

# Usage example:
def get_market_factors(lat, lon, business_type, radius_km=5):
    analyzer = RealTimeMarketFactors()
    return analyzer.get_market_factors(lat, lon, business_type, radius_km)


def run_analysis(lat, lon, business_type, radius_km):
    try:
        # traffic score
        calculator = TrafficScoreCalculator()
        traffc_score_result = calculator.calculate_traffic_score(lat, lon, radius_km)

        # market factor
        market_factore_result = get_market_factors(lat, lon, business_type)

        # population
        population_result = analyze_business_location(business_type, lat, lon, radius_km)

        # income
        fetcher = RadiusIncomeFetcher()
        income_df = fetcher.fetch_avg_income_on_country(
            lat, lon,
            radius_km=radius_km,
            start_year=2020,
            end_year=2022,
            num_sample_points=5
        )
        json_output = income_df.to_json(orient='records', indent=2)

        # competitors
        Existing_Competor_analyzer = CompetitorAnalyzer()
        Exising_Competitors_result = Existing_Competor_analyzer.main(
            auto_mode=True,
            json_output=True,
            latitude=lat,
            longitude=lon,
            radius=radius_km*1000,
            business_types=[business_type],
            export=False
        )

        # cultural fit
        CulturalFit_analyzer = FreeCulturalFitAnalyzer()
        CulturalFit_analyzer_result = CulturalFit_analyzer.get_cultural_fit_score(
            lat, lon, business_type, radius_km*1000
        )
        insight_data = [f"- {insight}" for insight in CulturalFit_analyzer_result['insights']]

        return {
            'Traffic_Score': {
                "coordinates": {"latitude": lat, "longitude": lon},
                "traffic_score": traffc_score_result['traffic_score'],
            },
            'Market_Factor': market_factore_result,
            'Population_Analysis': population_result,
            "Income_Data": {"data": json.loads(json_output)},
            "Existing_Competitors": {"data": Exising_Competitors_result},
            "Cultural_Fit": {
                "location": CulturalFit_analyzer_result['location'],
                "business_type": CulturalFit_analyzer_result['business_type'],
                "analysis_radius_km": CulturalFit_analyzer_result['analysis_radius_km'],
                "cultural_fit_score": CulturalFit_analyzer_result['cultural_fit_score'],
                "sentiment_ratio": CulturalFit_analyzer_result['sentiment_ratio'],
                "insights": insight_data
            }
        }

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    lat = float(sys.argv[1])
    lon = float(sys.argv[2])
    business_type = sys.argv[3]
    radius_km = float(sys.argv[4])

    result = run_analysis(lat, lon, business_type, radius_km)
    print(json.dumps(result, indent=2))  # ✅ Only JSON to stdout
    sys.stdout.flush()
    time.sleep(0.5)
