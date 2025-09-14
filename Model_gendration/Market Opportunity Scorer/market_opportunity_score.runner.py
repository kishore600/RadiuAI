# location_scoring_model.py
import json
import requests
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import random
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import sys

# ==================== DATA STRUCTURES ====================
@dataclass
class LocationScores:
    demographics: float
    competition: float
    accessibility: float
    growth_potential: float
    cultural_factors: float
    overall: float

# ==================== OPENSTREETMAP API INTEGRATION ====================
class OSMDataFetcher:
    def __init__(self):
        self.geolocator = Nominatim(user_agent="location_scoring_system")
        self.geocode = RateLimiter(self.geolocator.reverse, min_delay_seconds=1)
        self.overpass_url = "http://overpass-api.de/api/interpreter"
    
    def get_location_info(self, lat: float, lng: float) -> Dict:
        """Get location information including country code from coordinates using OpenStreetMap"""
        try:
            location = self.geocode(f"{lat}, {lng}")
            if location:
                address = location.raw.get('address', {})
                country_code = address.get('country_code', '').upper()
                
                # Try to get the most specific name available
                location_name = f"Location at {lat}, {lng}"
                for key in ['suburb', 'city', 'town', 'village', 'county', 'state', 'country']:
                    if key in address:
                        location_name = address[key]
                        break
                
                return {
                    "name": location_name,
                    "country_code": country_code,
                    "address": address
                }
            return {
                "name": f"Location at {lat}, {lng}",
                "country_code": "US",  # Default to US if no location found
                "address": {}
            }
        except Exception as e:
            print(f"Geocoding error: {e}")
            return {
                "name": f"Location at {lat}, {lng}",
                "country_code": "US",  # Default to US if error occurs
                "address": {}
            }
    
    def query_overpass_api(self, lat: float, lng: float, radius_km: int) -> Dict:
        """Query Overpass API for OpenStreetMap data around the location"""
        radius_meters = radius_km * 1000
        
        # Query for amenities, businesses, transportation, etc.
        overpass_query = f"""
        [out:json];
        (
          node(around:{radius_meters},{lat},{lng})["amenity"];
          way(around:{radius_meters},{lat},{lng})["amenity"];
          relation(around:{radius_meters},{lat},{lng})["amenity"];
          
          node(around:{radius_meters},{lat},{lng})["shop"];
          way(around:{radius_meters},{lat},{lng})["shop"];
          relation(around:{radius_meters},{lat},{lng})["shop"];
          
          node(around:{radius_meters},{lat},{lng})["highway"];
          way(around:{radius_meters},{lat},{lng})["highway"];
          relation(around:{radius_meters},{lat},{lng})["highway"];
          
          node(around:{radius_meters},{lat},{lng})["building"];
          way(around:{radius_meters},{lat},{lng})["building"];
          relation(around:{radius_meters},{lat},{lng})["building"];
        );
        out count;
        """
        
        try:
            response = requests.post(self.overpass_url, data=overpass_query)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Overpass API error: {e}")
            return {"elements": []}
    
    def estimate_from_osm_data(self, lat: float, lng: float, country_code: str, radius_km: int, business_type: str) -> Dict:
        """Estimate location factors based on OSM data"""
        osm_data = self.query_overpass_api(lat, lng, radius_km)
        
        # Count different types of elements
        amenities = sum(1 for element in osm_data.get('elements', []) 
                       if element.get('tags', {}).get('amenity'))
        shops = sum(1 for element in osm_data.get('elements', []) 
                   if element.get('tags', {}).get('shop'))
        highways = sum(1 for element in osm_data.get('elements', []) 
                      if element.get('tags', {}).get('highway'))
        buildings = sum(1 for element in osm_data.get('elements', []) 
                       if element.get('tags', {}).get('building'))
        
        total_elements = len(osm_data.get('elements', []))
        
        # Calculate business density (higher density = more competition)
        business_density = (amenities + shops) / (total_elements + 1) * 10
        
        # Calculate transportation score based on highway density
        transport_score = min(10, highways / (total_elements + 1) * 20)
        
        # Estimate development level based on building density
        development_level = min(10, buildings / (total_elements + 1) * 15)
        
        # Get country-specific factors
        country_factors = self.get_country_factors(country_code)
        
        return {
            "demographics": {
                "population_density": self.estimate_population_density(total_elements, country_code),
                "income_distribution": country_factors["income_level"],
                "age_composition": random.uniform(0.5, 0.8),  # Would use real data in production
                "education_levels": country_factors["education_level"]
            },
            "competition": {
                "market_saturation": business_density,
                "competitor_strength": business_density * 0.8,  # Stronger in dense areas
                "market_gaps": max(0, 10 - business_density),  # More gaps in less dense areas
                "price_competition": business_density * 0.7  # Higher competition in dense areas
            },
            "accessibility": {
                "traffic_flow": transport_score * 0.8,
                "public_transport": transport_score,
                "parking_availability": max(0, 10 - business_density * 0.5),  # Less parking in dense areas
                "walkability": transport_score * 0.9
            },
            "growth_potential": {
                "infrastructure_projects": development_level * 0.7,
                "new_developments": development_level * 0.6,
                "government_plans": country_factors["development_factor"] * 8,
                "economic_indicators": country_factors["development_factor"] * 9
            },
            "cultural_factors": {
                "cultural_compatibility": country_factors["cultural_factor"] * 9,
                "language_preferences": country_factors["english_proficiency"] * 10,
                "festival_impact": country_factors["cultural_factor"] * 8,
                "business_customs": country_factors["business_friendliness"] * 9
            }
        }
    
    def get_country_factors(self, country_code: str) -> Dict:
        """Get country-specific factors for normalization"""
        factors = {
            'US': {"income_level": 4000, "education_level": 0.8, "development_factor": 1.0, 
                  "cultural_factor": 0.9, "english_proficiency": 1.0, "business_friendliness": 0.95},
            'IN': {"income_level": 1500, "education_level": 0.6, "development_factor": 0.7, 
                  "cultural_factor": 0.8, "english_proficiency": 0.7, "business_friendliness": 0.75},
            'UK': {"income_level": 3500, "education_level": 0.85, "development_factor": 0.95, 
                  "cultural_factor": 0.9, "english_proficiency": 1.0, "business_friendliness": 0.9},
            'DE': {"income_level": 3800, "education_level": 0.9, "development_factor": 0.98, 
                  "cultural_factor": 0.85, "english_proficiency": 0.8, "business_friendliness": 0.92},
            'FR': {"income_level": 3200, "education_level": 0.8, "development_factor": 0.92, 
                  "cultural_factor": 0.85, "english_proficiency": 0.6, "business_friendliness": 0.8},
            'JP': {"income_level": 4200, "education_level": 0.9, "development_factor": 1.05, 
                  "cultural_factor": 0.7, "english_proficiency": 0.5, "business_friendliness": 0.85},
            'CN': {"income_level": 2000, "education_level": 0.7, "development_factor": 0.8, 
                  "cultural_factor": 0.6, "english_proficiency": 0.4, "business_friendliness": 0.7},
            'BR': {"income_level": 1200, "education_level": 0.5, "development_factor": 0.65, 
                  "cultural_factor": 0.75, "english_proficiency": 0.3, "business_friendliness": 0.65},
            'default': {"income_level": 2000, "education_level": 0.6, "development_factor": 0.7, 
                       "cultural_factor": 0.7, "english_proficiency": 0.5, "business_friendliness": 0.7}
        }
        
        country_code = country_code.upper() if country_code else 'US'
        return factors.get(country_code, factors['default'])
    
    def estimate_population_density(self, element_count: int, country_code: str) -> float:
        """Estimate population density based on OSM element count and country"""
        country_density_factors = {
            'US': 0.5, 'IN': 2.0, 'UK': 1.5, 'DE': 1.3, 
            'FR': 1.0, 'JP': 1.8, 'CN': 1.5, 'BR': 0.8
        }
        factor = country_density_factors.get(country_code, 1.0)
        return min(200, element_count * factor)

# ==================== SCORING ENGINE ====================
class ScoringEngine:
    def __init__(self):
        self.weights = {
            'demographics': 0.25,
            'competition': 0.25,
            'accessibility': 0.20,
            'growth_potential': 0.20,
            'cultural_factors': 0.10
        }
    
    def calculate_demographics_score(self, data: Dict, country_code: str) -> float:
        """Calculate demographics score (0-100)"""
        factors = {
            'population_density': 0.25,
            'income_distribution': 0.30,
            'age_composition': 0.25,
            'education_levels': 0.20
        }
        
        score = 0
        for factor, weight in factors.items():
            if factor in data:
                normalized_value = self._normalize_demographics_factor(
                    factor, data[factor], country_code
                )
                score += normalized_value * weight
        
        return min(100, max(0, score))
    
    def calculate_competition_score(self, data: Dict, business_type: str) -> float:
        """Calculate competition score based on business type"""
        if business_type == "it_services":
            factors = {
                'market_saturation': 0.30,
                'competitor_strength': 0.25,
                'market_gaps': 0.30,
                'price_competition': 0.15
            }
        else:
            factors = {
                'market_saturation': 0.40,
                'competitor_strength': 0.20,
                'market_gaps': 0.25,
                'price_competition': 0.15
            }
        
        score = 0
        for factor, weight in factors.items():
            if factor in data:
                normalized_value = self._normalize_competition_factor(factor, data[factor])
                score += normalized_value * weight
        
        if 'market_saturation' in data:
            saturation = data['market_saturation']
            score -= min(30, saturation * 0.3)
        
        return max(0, min(100, score))
    
    def calculate_accessibility_score(self, data: Dict) -> float:
        """Calculate accessibility score"""
        factors = {
            'traffic_flow': 0.25,
            'public_transport': 0.30,
            'parking_availability': 0.25,
            'walkability': 0.20
        }
        
        score = 0
        for factor, weight in factors.items():
            if factor in data:
                normalized_value = self._normalize_accessibility_factor(factor, data[factor])
                score += normalized_value * weight
        
        return min(100, score)
    
    def calculate_growth_potential_score(self, data: Dict, country_code: str) -> float:
        """Calculate growth potential score"""
        factors = {
            'infrastructure_projects': 0.30,
            'new_developments': 0.25,
            'government_plans': 0.25,
            'economic_indicators': 0.20
        }
        
        score = 0
        for factor, weight in factors.items():
            if factor in data:
                normalized_value = self._normalize_growth_factor(
                    factor, data[factor], country_code
                )
                score += normalized_value * weight
        
        return min(100, score)
    
    def calculate_cultural_factors_score(self, data: Dict, business_type: str) -> float:
        """Calculate cultural factors score"""
        factors = {
            'cultural_compatibility': 0.30,
            'language_preferences': 0.25,
            'festival_impact': 0.25,
            'business_customs': 0.20
        }
        
        score = 0
        for factor, weight in factors.items():
            if factor in data:
                normalized_value = self._normalize_cultural_factor(factor, data[factor])
                score += normalized_value * weight
        
        return min(100, score)
    
    def _normalize_demographics_factor(self, factor_name: str, value: float, country_code: str) -> float:
        """Normalize demographics factors with country adjustment"""
        if factor_name == 'population_density':
            return min(100, value / 150 * 100) if value > 0 else 0
        elif factor_name == 'income_distribution':
            return min(100, value / 3000 * 100)
        elif factor_name == 'age_composition':
            return value * 100
        elif factor_name == 'education_levels':
            return value * 100
        return min(100, value * 100)
    
    def _normalize_competition_factor(self, factor_name: str, value: float) -> float:
        """Normalize competition factors"""
        if factor_name == 'market_saturation':
            return 100 - (value * 10)
        elif factor_name == 'competitor_strength':
            return 100 - (value * 10)
        elif factor_name == 'market_gaps':
            return value * 10
        elif factor_name == 'price_competition':
            return 100 - (value * 10)
        return min(100, value * 100)
    
    def _normalize_accessibility_factor(self, factor_name: str, value: float) -> float:
        """Normalize accessibility factors"""
        if factor_name in ['traffic_flow', 'public_transport', 'parking_availability', 'walkability']:
            return value * 10
        return min(100, value * 100)
    
    def _normalize_growth_factor(self, factor_name: str, value: float, country_code: str) -> float:
        """Normalize growth factors with country adjustment"""
        if factor_name in ['infrastructure_projects', 'new_developments', 'government_plans', 'economic_indicators']:
            return value * 10
        return min(100, value * 100)
    
    def _normalize_cultural_factor(self, factor_name: str, value: float) -> float:
        """Normalize cultural factors"""
        if factor_name in ['cultural_compatibility', 'language_preferences', 'festival_impact', 'business_customs']:
            return value * 10
        return min(100, value * 100)
    
    def calculate_overall_score(self, location_data: Dict, business_type: str = "it_services", country_code: str = "US") -> LocationScores:
        """Calculate overall location attractiveness score"""
        demographics = self.calculate_demographics_score(location_data.get('demographics', {}), country_code)
        competition = self.calculate_competition_score(location_data.get('competition', {}), business_type)
        accessibility = self.calculate_accessibility_score(location_data.get('accessibility', {}))
        growth_potential = self.calculate_growth_potential_score(location_data.get('growth_potential', {}), country_code)
        cultural_factors = self.calculate_cultural_factors_score(location_data.get('cultural_factors', {}), business_type)
        
        overall = (
            demographics * self.weights['demographics'] +
            competition * self.weights['competition'] +
            accessibility * self.weights['accessibility'] +
            growth_potential * self.weights['growth_potential'] +
            cultural_factors * self.weights['cultural_factors']
        )
        
        return LocationScores(
            demographics=demographics,
            competition=competition,
            accessibility=accessibility,
            growth_potential=growth_potential,
            cultural_factors=cultural_factors,
            overall=overall
        )

# ==================== HELPER FUNCTIONS ====================
def generate_risk_factors(location_data: Dict, scores: LocationScores, business_type: str) -> List[str]:
    """Generate risk factors based on location data and scores"""
    risks = []
    
    if scores.competition < 60:
        risks.append("High competition in target sector")
    
    if location_data['demographics']['income_distribution'] < 2000:
        risks.append("Lower than optimal income levels")
    
    if location_data['accessibility']['parking_availability'] < 6:
        risks.append("Limited parking availability")
    
    if location_data['competition']['market_saturation'] > 7:
        risks.append(f"Market saturation level high ({location_data['competition']['market_saturation']:.1f}/10)")
    
    if location_data['growth_potential']['economic_indicators'] < 6:
        risks.append("Below average economic indicators")
    
    if business_type == "it_services" and location_data['cultural_factors']['language_preferences'] < 7:
        risks.append("Potential language barriers for IT services")
    
    return risks

def generate_opportunities(location_data: Dict, scores: LocationScores, business_type: str) -> List[str]:
    """Generate opportunities based on location data and scores"""
    opportunities = []
    
    if scores.growth_potential > 75:
        opportunities.append("High growth potential with new developments")
    
    if location_data['demographics']['age_composition'] > 0.6:
        opportunities.append("Favorable age demographic for business")
    
    if location_data['cultural_factors']['language_preferences'] > 8 and business_type == "it_services":
        opportunities.append("Strong English proficiency favorable for IT business")
    
    if location_data['competition']['market_gaps'] > 7:
        opportunities.append("Significant market gaps present opportunity for differentiation")
    
    if location_data['growth_potential']['infrastructure_projects'] > 8:
        opportunities.append("Upcoming infrastructure projects will improve accessibility")
    
    if location_data['demographics']['education_levels'] > 0.7:
        opportunities.append("Highly educated population provides skilled workforce")
    
    if location_data['competition']['market_saturation'] < 5:
        opportunities.append("Low market saturation presents expansion opportunities")
    
    return opportunities

def get_rating_label(score: float) -> str:
    """Get a textual rating based on the score"""
    if score >= 90:
        return "Exceptional Investment Opportunity"
    elif score >= 80:
        return "Excellent Investment Opportunity"
    elif score >= 70:
        return "Good Investment Opportunity"
    elif score >= 60:
        return "Moderate Investment Opportunity"
    elif score >= 50:
        return "Marginal Investment Opportunity"
    else:
        return "Poor Investment Opportunity"

# ==================== MAIN SCORING FUNCTION ====================
def score_location(latitude: float, longitude: float, 
                  business_type: str = "it_services", radius_km: int = 5) -> Dict:
    """Main function to score a location and return JSON results"""
    scoring_engine = ScoringEngine()
    osm_fetcher = OSMDataFetcher()
    
    # Get location info including country code from coordinates
    location_info = osm_fetcher.get_location_info(latitude, longitude)
    country_code = location_info["country_code"]
    location_name = location_info["name"]
    
    # Get data for the location from OpenStreetMap
    location_data = osm_fetcher.estimate_from_osm_data(
        latitude, longitude, country_code, radius_km, business_type
    )
    
    # Calculate scores
    scores = scoring_engine.calculate_overall_score(
        location_data, 
        business_type,
        country_code
    )
    
    # Generate insights
    risk_factors = generate_risk_factors(location_data, scores, business_type)
    opportunities = generate_opportunities(location_data, scores, business_type)
    
    # Prepare the response
    response = {
        "location": {
            "name": location_name,
            "latitude": latitude,
            "longitude": longitude,
            "country_code": country_code,
            "business_type": business_type,
            "radius_km": radius_km
        },
        "scores": asdict(scores),
        "rating": get_rating_label(scores.overall),
        "risk_factors": risk_factors,
        "opportunities": opportunities,
        "raw_data": location_data
    }
    
    return response

if __name__ == "__main__":
    lat = float(sys.argv[1])
    lon = float(sys.argv[2])
    business_type = sys.argv[3]

    result = []
    result = score_location(lat, lon,business_type)
    print(json.dumps(result, indent=2)) 
    sys.stdout.flush()
    time.sleep(0.5)
