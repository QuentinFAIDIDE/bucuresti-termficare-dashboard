import { getStations, getCountData, getStationDetails } from "./api.js";

// Mock fetch
global.fetch = jest.fn();

describe("getStations", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("should return stations with required properties", async () => {
    // Mock API response
    const mockResponse = {
      data: [
        {
          geoId: "123",
          lastStatus: "working",
          longitude: 26.119855,
          latitude: 44.386471,
          name: "Test Station",
        },
      ],
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const stations = await getStations();
    expect(Array.isArray(stations)).toBe(true);
    expect(stations.length).toBeGreaterThan(0);

    stations.forEach((station) => {
      expect(station).toHaveProperty("id");
      expect(typeof station.id).toBe("string");
      expect(station).toHaveProperty("status");
      expect(station).toHaveProperty("name");
      expect(station).toHaveProperty("longitude");
      expect(station).toHaveProperty("latitude");
      expect(typeof station.latitude).toBe("number");
      expect(typeof station.longitude).toBe("number");
    });
  });
});

describe("getCountData", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("should return count data with required properties", async () => {
    const mockResponse = {
      data: [
        {
          time: 1640995200,
          numGreen: 150,
          numYellow: 25,
          numRed: 10
        },
        {
          time: 1641081600,
          numGreen: 145,
          numYellow: 30,
          numRed: 15
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const data = await getCountData();
    expect(data).toHaveProperty("timestamps");
    expect(data).toHaveProperty("working");
    expect(data).toHaveProperty("issues");
    expect(data).toHaveProperty("broken");
    expect(Array.isArray(data.timestamps)).toBe(true);
    expect(Array.isArray(data.working)).toBe(true);
    expect(data.timestamps.length).toBe(2);
    expect(data.working[0]).toBe(150);
    expect(data.issues[0]).toBe(25);
    expect(data.broken[0]).toBe(10);
  });
});

describe("getStationDetails", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("should return station details with required properties", async () => {
    const mockResponse = {
      data: [
        {
          status: "broken",
          fetchTime: 1640995200,
          incidentText: "System failure",
          incidentType: "mechanical"
        },
        {
          status: "working",
          fetchTime: 1641081600,
          incidentText: null,
          incidentType: null
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const details = await getStationDetails("123");
    expect(Array.isArray(details)).toBe(true);
    expect(details.length).toBe(2);
    
    details.forEach((detail) => {
      expect(detail).toHaveProperty("status");
      expect(detail).toHaveProperty("timestamp");
      expect(detail.timestamp instanceof Date).toBe(true);
      expect(detail).toHaveProperty("description");
      expect(detail).toHaveProperty("failureType");
    });
  });
});
