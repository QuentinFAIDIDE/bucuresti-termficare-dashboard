import xml.etree.ElementTree as ET

# Parse the XML file
tree = ET.parse('public/nomenclator_stradal_bucuresti.xml')
root = tree.getroot()

# Open output file
with open('nomenclator_output.txt', 'w', encoding='utf-8') as f:
    # Find all Artere elements
    for artere in root.findall('Artere'):
        categorie = artere.find('Categorie').text.strip()
        denumire = artere.find('Denumire').text.strip()
        # Transform to definite article forms
        transformations = {
            "strada": "Strada",
            "bulevard": "Bulevardul",
            "drum": "Drumul",
            "intrare": "Intrarea",
            "tunel": "Tunelul",
            "piata": "Piața",
            "cale": "Calea",
            "sosea": "Șoseaua",
            "alee": "Aleea",
            "splai": "Splaiul",
            "pasaj": "Pasajul",
            "pod": "Podul",
            "parc": "Parcul",
            "prelungire": "Prelungirea"
        }
        # to remove part after comma that contains historical
        # figures profession
        denumireSplit = denumire.split(",")
        
        if categorie in transformations:
            categorie = transformations[categorie]
    
        f.write(f"{categorie} {denumireSplit[0]}\n")

print("Data extracted to nomenclator_flat.txt")