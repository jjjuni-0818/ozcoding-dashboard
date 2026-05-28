"""
regions.py
==========
Static reference data: city → region mapping, lat/lon coordinates,
and brand-name normalization (Cosentyx SKUs collapsed to a single brand).

Pure-data module — no I/O. Import these constants/functions from data.py.
"""

# -----------------------------------------------------------------------------
# Brand normalization
# -----------------------------------------------------------------------------
def normalize_brand(brnd_name: str) -> str:
    """Collapse Cosentyx SKUs (Pen, Pen 2-pack, Syringe, ...) into 'Cosentyx'."""
    if not brnd_name:
        return brnd_name
    if brnd_name.lower().startswith("cosentyx"):
        return "Cosentyx"
    return brnd_name


BRANDS = ["Entresto", "Cosentyx", "Lucentis"]


# -----------------------------------------------------------------------------
# Region mapping
# -----------------------------------------------------------------------------
SOCAL_CITIES = {
    "Los Angeles", "Long Beach", "Pasadena", "Glendale", "Burbank", "Santa Monica",
    "Beverly Hills", "Torrance", "Inglewood", "El Segundo", "Culver City",
    "Hawthorne", "Lakewood", "Downey", "Whittier", "Pomona", "Hacienda Heights",
    "La Verne", "Claremont", "Walnut", "West Covina", "Arcadia", "Monterey Park",
    "Alhambra", "Rosemead", "El Monte", "San Gabriel", "Montebello", "Cerritos",
    "Buena Park", "Anaheim", "Orange", "Santa Ana", "Irvine", "Newport Beach",
    "Costa Mesa", "Huntington Beach", "Fountain Valley", "Garden Grove",
    "Westminster", "Mission Viejo", "Laguna Hills", "San Clemente", "Fullerton",
    "Tustin", "Yorba Linda", "San Diego", "Chula Vista", "La Jolla", "El Cajon",
    "La Mesa", "Carlsbad", "Encinitas", "Escondido", "Oceanside", "National City",
    "Vista", "Poway", "Coronado", "Riverside", "Corona", "Moreno Valley",
    "Murrieta", "Temecula", "Hemet", "Indio", "Palm Springs", "Palm Desert",
    "Rancho Mirage", "Cathedral City", "La Quinta", "San Bernardino", "Fontana",
    "Ontario", "Rancho Cucamonga", "Upland", "Redlands", "Chino", "Chino Hills",
    "Victorville", "Hesperia", "Apple Valley", "Big Bear Lake", "Loma Linda",
    "Ventura", "Oxnard", "Thousand Oaks", "Simi Valley", "Camarillo", "Moorpark",
    "Westlake Village", "Santa Barbara", "Goleta", "Santa Maria", "Lompoc",
    "Carpinteria", "Solvang", "El Centro", "Brawley", "Calexico",
    "Rancho Palos Verdes", "Phillips Ranch", "Manhattan Beach", "Redondo Beach",
    "Lawndale", "Santa Clarita", "Valencia", "Lancaster", "Palmdale", "Sylmar",
    "Northridge", "Encino", "Sherman Oaks", "Studio City", "North Hollywood",
    "Van Nuys", "Reseda", "Tarzana", "Mar Vista", "West Hollywood", "Cypress",
    "La Habra", "Brea", "Placentia", "Stanton", "Yucaipa", "Beaumont", "Banning",
    "Highland", "Colton", "Grand Terrace", "Rialto",
}

NORCAL_CITIES = {
    "San Francisco", "Oakland", "Berkeley", "San Jose", "Palo Alto",
    "Mountain View", "Sunnyvale", "Santa Clara", "Cupertino", "Milpitas",
    "Fremont", "Hayward", "San Mateo", "Redwood City", "Daly City",
    "South San Francisco", "Burlingame", "San Bruno", "Pacifica", "Half Moon Bay",
    "Sacramento", "Elk Grove", "Roseville", "Folsom", "Citrus Heights",
    "Carmichael", "Rancho Cordova", "Davis", "Woodland", "Vacaville", "Fairfield",
    "Vallejo", "Napa", "Sonoma", "Santa Rosa", "Petaluma", "Walnut Creek",
    "Concord", "Pleasant Hill", "Antioch", "Pittsburg", "Martinez", "Richmond",
    "Pleasanton", "Livermore", "Dublin", "Castro Valley", "San Leandro",
    "Alameda", "Salinas", "Monterey", "Carmel", "Pacific Grove", "Seaside",
    "Marina", "Templeton", "Stockton", "Modesto", "Lodi", "Tracy", "Manteca",
    "Turlock", "Eureka", "Redding", "Chico", "Yreka", "Crescent City", "Ukiah",
    "Lakeport", "Mendocino",
}


def city_region(city: str) -> str:
    if city in SOCAL_CITIES:
        return "SoCal"
    if city in NORCAL_CITIES:
        return "NorCal"
    return "Central"


# -----------------------------------------------------------------------------
# City lat/lon coordinates  (used for the map widget)
# -----------------------------------------------------------------------------
CITY_COORDS = {
    "Los Angeles": (34.05, -118.24), "Long Beach": (33.77, -118.19),
    "Pasadena": (34.15, -118.14), "Glendale": (34.15, -118.25),
    "Burbank": (34.18, -118.31), "Santa Monica": (34.02, -118.49),
    "Beverly Hills": (34.07, -118.40), "Torrance": (33.84, -118.34),
    "Inglewood": (33.96, -118.35), "Downey": (33.94, -118.13),
    "Whittier": (33.98, -118.03), "Pomona": (34.06, -117.75),
    "West Covina": (34.07, -117.94), "Arcadia": (34.14, -118.04),
    "Alhambra": (34.10, -118.13), "El Monte": (34.07, -118.03),
    "Montebello": (34.01, -118.11), "Cerritos": (33.86, -118.07),
    "Anaheim": (33.84, -117.91), "Orange": (33.79, -117.85),
    "Santa Ana": (33.75, -117.87), "Irvine": (33.68, -117.83),
    "Newport Beach": (33.62, -117.93), "Costa Mesa": (33.64, -117.92),
    "Huntington Beach": (33.66, -117.99), "Fountain Valley": (33.71, -117.95),
    "Garden Grove": (33.77, -117.94), "Westminster": (33.76, -117.99),
    "Mission Viejo": (33.60, -117.66), "Fullerton": (33.87, -117.92),
    "Tustin": (33.74, -117.81), "San Diego": (32.71, -117.16),
    "Chula Vista": (32.64, -117.08), "La Jolla": (32.83, -117.27),
    "El Cajon": (32.79, -116.96), "La Mesa": (32.76, -117.02),
    "Carlsbad": (33.16, -117.34), "Encinitas": (33.03, -117.29),
    "Escondido": (33.12, -117.08), "Oceanside": (33.19, -117.37),
    "Riverside": (33.95, -117.39), "Corona": (33.87, -117.56),
    "Moreno Valley": (33.93, -117.23), "Temecula": (33.49, -117.14),
    "Palm Springs": (33.83, -116.54), "Palm Desert": (33.72, -116.37),
    "Rancho Mirage": (33.73, -116.42), "San Bernardino": (34.10, -117.30),
    "Fontana": (34.09, -117.43), "Ontario": (34.06, -117.65),
    "Rancho Cucamonga": (34.10, -117.59), "Redlands": (34.05, -117.18),
    "Victorville": (34.53, -117.29), "Loma Linda": (34.04, -117.26),
    "Ventura": (34.27, -119.22), "Oxnard": (34.19, -119.17),
    "Thousand Oaks": (34.17, -118.83), "Simi Valley": (34.26, -118.78),
    "Camarillo": (34.21, -119.03), "Westlake Village": (34.14, -118.80),
    "Santa Barbara": (34.42, -119.69), "Santa Maria": (34.95, -120.43),
    "El Centro": (32.79, -115.56), "San Francisco": (37.77, -122.41),
    "Oakland": (37.80, -122.27), "Berkeley": (37.87, -122.27),
    "San Jose": (37.33, -121.88), "Palo Alto": (37.44, -122.14),
    "Mountain View": (37.39, -122.08), "Sunnyvale": (37.36, -122.03),
    "Santa Clara": (37.35, -121.95), "Fremont": (37.55, -121.99),
    "Hayward": (37.66, -122.08), "San Mateo": (37.56, -122.32),
    "Daly City": (37.71, -122.46), "Sacramento": (38.58, -121.49),
    "Elk Grove": (38.41, -121.37), "Roseville": (38.75, -121.29),
    "Folsom": (38.68, -121.18), "Davis": (38.54, -121.74),
    "Vacaville": (38.36, -121.99), "Fairfield": (38.25, -122.04),
    "Vallejo": (38.10, -122.26), "Napa": (38.30, -122.28),
    "Santa Rosa": (38.44, -122.71), "Petaluma": (38.23, -122.64),
    "Walnut Creek": (37.91, -122.07), "Concord": (37.98, -122.03),
    "Pleasanton": (37.66, -121.87), "Livermore": (37.68, -121.77),
    "Monterey": (36.60, -121.89), "Salinas": (36.68, -121.66),
    "Stockton": (37.96, -121.29), "Modesto": (37.64, -120.99),
    "Fresno": (36.74, -119.78), "Bakersfield": (35.37, -119.02),
    "Visalia": (36.33, -119.29), "Redding": (40.59, -122.39),
    "Chico": (39.73, -121.84), "Eureka": (40.80, -124.16),
    "Santa Clarita": (34.39, -118.54), "Valencia": (34.43, -118.61),
    "Lancaster": (34.69, -118.15), "Palmdale": (34.58, -118.12),
    "Northridge": (34.23, -118.53), "Encino": (34.16, -118.50),
    "Sherman Oaks": (34.15, -118.45), "Van Nuys": (34.19, -118.45),
    "Tarzana": (34.17, -118.55), "San Clemente": (33.43, -117.61),
    "Laguna Hills": (33.59, -117.71), "Yorba Linda": (33.89, -117.81),
    "La Habra": (33.93, -117.94), "Brea": (33.92, -117.90),
    "Placentia": (33.87, -117.86), "Buena Park": (33.86, -117.99),
    "Cypress": (33.81, -118.03), "Lakewood": (33.85, -118.13),
    "Hawthorne": (33.91, -118.35), "Manhattan Beach": (33.88, -118.41),
    "Redondo Beach": (33.84, -118.39), "Rancho Palos Verdes": (33.74, -118.36),
    "Hacienda Heights": (33.99, -117.96), "La Verne": (34.10, -117.76),
    "Walnut": (34.02, -117.86), "Claremont": (34.10, -117.71),
    "Monterey Park": (34.06, -118.12), "Rosemead": (34.08, -118.07),
    "San Gabriel": (34.09, -118.10), "Chino": (34.01, -117.69),
    "Chino Hills": (33.99, -117.73), "Upland": (34.10, -117.65),
    "Yucaipa": (34.03, -117.04), "Highland": (34.13, -117.21),
    "Colton": (34.07, -117.31), "Rialto": (34.10, -117.37),
    "Hemet": (33.75, -116.97), "Indio": (33.72, -116.21),
    "La Quinta": (33.66, -116.30), "Cathedral City": (33.78, -116.47),
    "Beaumont": (33.93, -116.97), "Murrieta": (33.55, -117.21),
    "Apple Valley": (34.50, -117.19), "Hesperia": (34.43, -117.30),
    "Carmichael": (38.61, -121.33), "Citrus Heights": (38.71, -121.28),
    "Rancho Cordova": (38.59, -121.30), "Woodland": (38.68, -121.77),
    "Pittsburg": (38.03, -121.88), "Antioch": (38.00, -121.81),
    "Martinez": (38.02, -122.13), "Pleasant Hill": (37.95, -122.06),
    "Richmond": (37.94, -122.34), "San Leandro": (37.72, -122.16),
    "Alameda": (37.77, -122.24), "Castro Valley": (37.69, -122.09),
    "Dublin": (37.71, -121.94), "Milpitas": (37.43, -121.90),
    "Cupertino": (37.32, -122.03), "South San Francisco": (37.65, -122.41),
    "San Bruno": (37.63, -122.41), "Burlingame": (37.58, -122.37),
    "Redwood City": (37.49, -122.23), "Templeton": (35.55, -120.71),
    "Lodi": (38.13, -121.27), "Tracy": (37.74, -121.43),
    "Manteca": (37.80, -121.22), "Turlock": (37.49, -120.85),
    "Sonoma": (38.29, -122.46), "Goleta": (34.44, -119.83),
    "Carpinteria": (34.40, -119.52), "Solvang": (34.59, -120.14),
    "Lompoc": (34.64, -120.46), "Phillips Ranch": (34.02, -117.81),
    "El Segundo": (33.92, -118.42), "Mar Vista": (34.00, -118.43),
    "West Hollywood": (34.09, -118.36), "Culver City": (34.02, -118.40),
    "Studio City": (34.14, -118.39), "North Hollywood": (34.17, -118.38),
    "Coronado": (32.69, -117.18), "National City": (32.68, -117.10),
    "Vista": (33.20, -117.24), "Poway": (32.96, -117.04),
    "Moorpark": (34.29, -118.88), "Stanton": (33.80, -117.99),
}
