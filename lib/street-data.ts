export interface Street {
  id: string;
  name: string;
}

// Load street data from the nomenclator output file
export const getStreetData = async (): Promise<Street[]> => {
  try {
    const response = await fetch('/nomenclator_output.txt');
    const streetText = await response.text();
    
    return streetText
      .split('\n')
      .filter(line => line.trim())
      .map((street, index) => ({
        id: `street-${index}`,
        name: street.trim()
      }));
  } catch (error) {
    console.error('Failed to load street data:', error);
    return [];
  }
};