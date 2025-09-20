// import axios from 'axios';
// import * as cheerio from 'cheerio';
// import { getFlightsByType } from '../data/mockFlights.js';

// // Helper to format date as YYYY-MM-DD
// function getTodayStr() {
//   const today = new Date();
//   return today.toISOString().slice(0, 10);
// }

// // Helper to format time
// function formatTime(timeStr) {
//   if (!timeStr) return '';
//   const time = timeStr.trim();
//   if (time.includes(':')) {
//     const [hours, minutes] = time.split(':');
//     const hour = parseInt(hours);
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
//     return `${displayHour}:${minutes} ${ampm}`;
//   }
//   return time;
// }

// // Helper to clean airline name
// function cleanAirlineName(name) {
//   if (!name) return '';
//   return name.replace(/[^\w\s]/g, '').trim();
// }

// // Helper to extract flight number from text
// function extractFlightNumber(text) {
//   if (!text) return '';
//   const match = text.match(/([A-Z]{2,3}\s*\d{1,4})/);
//   return match ? match[1].replace(/\s+/g, '') : '';
// }

// // Helper to format time from mock data
// function formatMockTime(timeStr) {
//   if (!timeStr) return '';
  
//   console.log('🔍 Debug - Original time string:', timeStr, 'Type:', typeof timeStr);
  
//   // If it's already in a good format like "10:30 AM", return as is
//   if (timeStr.includes('AM') || timeStr.includes('PM')) {
//     return timeStr;
//   }
  
//   // If it's a time string like "10:30:45 AM", extract just the time part
//   if (timeStr.includes(':')) {
//     const timeMatch = timeStr.match(/(\d{1,2}):(\d{2}):\d{2}\s*[AP]M/);
//     if (timeMatch) {
//       const [, hours, minutes] = timeMatch;
//       const hour = parseInt(hours);
//       const ampm = hour >= 12 ? 'PM' : 'AM';
//       const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
//       return `${displayHour}:${minutes} ${ampm}`;
//     }
//   }
  
//   // If it's a simple time like "10:30"
//   const simpleTimeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
//   if (simpleTimeMatch) {
//     const [, hours, minutes] = simpleTimeMatch;
//     const hour = parseInt(hours);
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
//     return `${displayHour}:${minutes} ${ampm}`;
//   }
  
//   console.log('⚠️ Could not format time:', timeStr);
//   return timeStr;
// }

// // Map scraped flight data to frontend format
// function mapScrapedFlight(flight, type) {
//   return {
//     flightNumber: flight.flightNumber || '',
//     airline: flight.airline || '',
//     airlineImg: '',
//     origin: flight.origin || '',
//     destination: flight.destination || '',
//     scheduledTime: flight.scheduledTime || '',
//     estimatedTime: flight.estimatedTime || '',
//     status: flight.status || '',
//     terminal: flight.terminal || '',
//     type: type
//   };
// }

// // FlightRadar24 API scraper - uses their internal API
// export async function scrapeFlightRadar24(type) {
//   try {
//     console.log(`🛩️ Scraping FlightRadar24 for BLR ${type}...`);
    
//     // FlightRadar24 internal API endpoints
//     const endpoints = [
//       // Main airport data API
//       {
//         name: 'FlightRadar24 Airport API',
//         url: `https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=12.5,13.5,77.5,78.5&faa=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=900&gliders=1&stats=1`,
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//           'Accept': 'application/json, text/javascript, */*; q=0.01',
//           'Accept-Language': 'en-US,en;q=0.9',
//           'Accept-Encoding': 'gzip, deflate, br',
//           'Referer': 'https://www.flightradar24.com/',
//           'Origin': 'https://www.flightradar24.com',
//           'Connection': 'keep-alive',
//           'Sec-Fetch-Dest': 'empty',
//           'Sec-Fetch-Mode': 'cors',
//           'Sec-Fetch-Site': 'same-site'
//         }
//       },
//       // BLR specific airport data
//       {
//         name: 'FlightRadar24 BLR API',
//         url: `https://data-live.flightradar24.com/airport/BLR/${type === 'departures' ? 'departures' : 'arrivals'}`,
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//           'Accept': 'application/json, text/javascript, */*; q=0.01',
//           'Accept-Language': 'en-US,en;q=0.9',
//           'Accept-Encoding': 'gzip, deflate, br',
//           'Referer': 'https://www.flightradar24.com/data/airports/blr/',
//           'Origin': 'https://www.flightradar24.com',
//           'Connection': 'keep-alive',
//           'Sec-Fetch-Dest': 'empty',
//           'Sec-Fetch-Mode': 'cors',
//           'Sec-Fetch-Site': 'same-site'
//         }
//       },
//       // FlightRadar24 search API
//       {
//         name: 'FlightRadar24 Search API',
//         url: `https://data-live.flightradar24.com/search.js?query=BLR&limit=50`,
//       headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//           'Accept': 'application/json, text/javascript, */*; q=0.01',
//           'Accept-Language': 'en-US,en;q=0.9',
//           'Accept-Encoding': 'gzip, deflate, br',
//           'Referer': 'https://www.flightradar24.com/',
//           'Origin': 'https://www.flightradar24.com',
//           'Connection': 'keep-alive',
//           'Sec-Fetch-Dest': 'empty',
//           'Sec-Fetch-Mode': 'cors',
//           'Sec-Fetch-Site': 'same-site'
//         }
//       }
//     ];

//     for (const endpoint of endpoints) {
//       try {
//         console.log(`Trying ${endpoint.name}...`);
        
//         const response = await axios.get(endpoint.url, {
//           headers: endpoint.headers,
//           timeout: 15000
//         });

//         const data = response.data;
//         const flights = [];

//         if (endpoint.name === 'FlightRadar24 Airport API' && data && data.result) {
//           // Parse FlightRadar24 airport data
//           Object.values(data.result).forEach(flight => {
//             if (flight && flight[1] && flight[1].includes('BLR')) {
//               const flightInfo = flight[1];
//               const flightNumber = flightInfo.match(/([A-Z]{2,3}\d{1,4})/)?.[1] || '';
//               const airline = flightInfo.match(/^([A-Z]{2,3})/)?.[1] || '';
              
//               if (flightNumber && airline) {
//                 flights.push({
//                   flightNumber,
//                   airline: getAirlineName(airline),
//                   origin: type === 'departures' ? 'Bengaluru (BLR)' : 'N/A',
//                   destination: type === 'departures' ? 'N/A' : 'Bengaluru (BLR)',
//                   scheduledTime: formatTimeFromTimestamp(flight[4]),
//                   estimatedTime: formatTimeFromTimestamp(flight[5]),
//                   status: getFlightStatus(flight[6]),
//                   terminal: 'T1'
//                 });
//               }
//             }
//           });
//         } else if (endpoint.name === 'FlightRadar24 BLR API' && data && data.result) {
//           // Parse BLR specific data
//           data.result.response.airport.pluginData.schedule[type === 'departures' ? 'departures' : 'arrivals'].data.forEach(flight => {
//             flights.push({
//               flightNumber: flight.flight.number || '',
//               airline: flight.airline.name || '',
//               origin: type === 'departures' ? 'Bengaluru (BLR)' : (flight.airport.origin.name || ''),
//               destination: type === 'departures' ? (flight.airport.destination.name || '') : 'Bengaluru (BLR)',
//               scheduledTime: formatTimeFromTimestamp(flight.time.scheduled.departure || flight.time.scheduled.arrival),
//               estimatedTime: formatTimeFromTimestamp(flight.time.estimated.departure || flight.time.estimated.arrival),
//               status: flight.status.text || 'Scheduled',
//               terminal: flight.airport.origin.terminal || flight.airport.destination.terminal || 'T1'
//             });
//           });
//         }

//         if (flights.length > 0) {
//           console.log(`✅ ${endpoint.name} successful: found ${flights.length} flights`);
//           return flights;
//         }
//       } catch (err) {
//         console.log(`❌ ${endpoint.name} failed: ${err.message}`);
//         continue;
//       }
//     }

//     return [];
//   } catch (err) {
//     console.error('FlightRadar24 scraping failed:', err.message);
//     return [];
//   }
// }

// // Helper to get airline name from code
// function getAirlineName(code) {
//   const airlines = {
//     'AI': 'Air India',
//     '6E': 'IndiGo',
//     'SG': 'SpiceJet',
//     'UK': 'Vistara',
//     'G8': 'GoAir',
//     'I5': 'AirAsia India',
//     '9W': 'Jet Airways',
//     'AK': 'AirAsia',
//     'ET': 'Ethiopian Airlines',
//     'QR': 'Qatar Airways',
//     'EK': 'Emirates',
//     'EY': 'Etihad Airways'
//   };
//   return airlines[code] || code;
// }

// // Helper to format time from timestamp
// function formatTimeFromTimestamp(timestamp) {
//   if (!timestamp) return '';
//   const date = new Date(timestamp * 1000);
//   return formatTime(date.toLocaleTimeString('en-US', { hour12: false }));
// }

// // Helper to get flight status
// function getFlightStatus(statusCode) {
//   const statuses = {
//     'A': 'Active',
//     'C': 'Cancelled',
//     'D': 'Diverted',
//     'L': 'Landed',
//     'S': 'Scheduled'
//   };
//   return statuses[statusCode] || 'Scheduled';
// }

// // Try multiple real-time data sources
// async function tryMultipleRealTimeSources(type) {
//   const sources = [
//     // Source 1: FlightRadar24 (Primary - most reliable)
//     {
//       name: 'FlightRadar24',
//       scraper: () => scrapeFlightRadar24(type)
//     },
//     // Source 2: BLR Official API with enhanced headers
//     {
//       name: 'BLR Official API',
//       url: `https://gateway.bengaluruairport.com/fis/v2/api/aodb/flights?orgAirport=BLR&destAirport=ALL&boundId=${type === 'departures' ? 'dep' : 'arr'}&flDate=${getTodayStr().replace(/-/g, '')}&`,
//       isApi: true,
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//         'Accept': 'application/json, text/plain, */*',
//         'Accept-Language': 'en-US,en;q=0.9',
//         'Accept-Encoding': 'gzip, deflate, br',
//         'Origin': 'https://www.bengaluruairport.com',
//         'Referer': 'https://www.bengaluruairport.com/',
//         'Connection': 'keep-alive',
//         'Sec-Fetch-Dest': 'empty',
//         'Sec-Fetch-Mode': 'cors',
//         'Sec-Fetch-Site': 'same-origin',
//         'Cache-Control': 'no-cache',
//         'Pragma': 'no-cache'
//       }
//     },
//     // Source 3: AviationStack API
//     {
//       name: 'AviationStack',
//       url: `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_KEY || 'demo'}&dep_iata=BLR&flight_status=active`,
//       isApi: true,
//       headers: {
//         'Accept': 'application/json'
//       }
//     },
//     // Source 4: Scrape from BLR website with different approach
//     {
//       name: 'BLR Website Direct',
//       url: `https://www.bengaluruairport.com/flight-status/${type}`,
//       isHtml: true,
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//         'Accept-Language': 'en-US,en;q=0.5',
//         'Accept-Encoding': 'gzip, deflate, br',
//         'Connection': 'keep-alive',
//         'Upgrade-Insecure-Requests': '1',
//         'Cache-Control': 'no-cache'
//       }
//     }
//   ];

//   for (const source of sources) {
//     try {
//       console.log(`Trying ${source.name} for ${type}...`);
      
//       if (source.scraper) {
//         // Use custom scraper function
//         const flights = await source.scraper();
//         if (flights.length > 0) {
//           console.log(`✅ ${source.name} successful: found ${flights.length} flights`);
//           return flights;
//         }
//       } else {
//         // Use standard API/HTML approach
//         const response = await axios.get(source.url, {
//           headers: source.headers,
//           timeout: 15000
//         });

//         if (source.isApi) {
//           // Handle API responses
//           const data = response.data;
          
//           if (source.name === 'BLR Official API' && data && data.data) {
//             const flights = type === 'departures' ? (data.data.dep || []) : (data.data.arr || []);
//             if (flights.length > 0) {
//               console.log(`✅ ${source.name} successful: found ${flights.length} flights`);
//               return flights.map(flight => ({
//                 flightNumber: flight.flight_unique_no || flight.flightNumber || '',
//                 airline: flight.airline_name || flight.airline || '',
//                 origin: type === 'departures' ? 'Bengaluru (BLR)' : (flight.base_airport_name || ''),
//                 destination: type === 'departures' ? (flight.srcdest_airport_name || '') : 'Bengaluru (BLR)',
//                 scheduledTime: flight.schedule_hour_id || flight.scheduled_time || '',
//                 estimatedTime: flight.estimated_hour_id || flight.estimated_time || '',
//                 status: flight.flight_status_id || flight.status || 'Scheduled',
//                 terminal: flight.baseTerminal || flight.terminal || 'T1'
//               }));
//             }
//           }
          
//           if (source.name === 'AviationStack' && data && data.data) {
//             const flights = data.data.filter(f => f.departure && f.departure.iata === 'BLR');
//             if (flights.length > 0) {
//               console.log(`✅ ${source.name} successful: found ${flights.length} flights`);
//               return flights.map(flight => ({
//                 flightNumber: flight.flight.iata || flight.flight.number || '',
//                 airline: flight.airline.name || flight.airline.iata || '',
//                 origin: 'Bengaluru (BLR)',
//                 destination: flight.arrival.airport || flight.arrival.iata || '',
//                 scheduledTime: flight.departure.scheduled || '',
//                 estimatedTime: flight.departure.estimated || '',
//                 status: flight.flight_status || 'Scheduled',
//                 terminal: flight.departure.terminal || 'T1'
//               }));
//             }
//           }
//         } else if (source.isHtml) {
//           // Handle HTML scraping
//           const $ = cheerio.load(response.data);
//           const flights = [];

//           // Try multiple selectors for flight data
//           const selectors = [
//             '.flight-row', '.departure-row', '.arrival-row', 
//             '.flight-card', '.departure-card', '.arrival-card',
//             'tr[data-flight]', '.flight-item', '.flight-data',
//             'table tbody tr', '.flight-table tr'
//           ];

//           for (const selector of selectors) {
//             $(selector).each((index, element) => {
//               const $el = $(element);
//               const text = $el.text();
              
//               // Extract flight number
//               const flightNumber = extractFlightNumber(text);
//               if (!flightNumber) return;

//               // Extract other data
//               const airline = cleanAirlineName($el.find('.airline, .carrier, .airline-name, td:nth-child(2)').text());
//               const origin = type === 'departures' ? 'Bengaluru (BLR)' : 
//                             ($el.find('.origin, .from, .source, td:nth-child(3)').text().trim() || 'N/A');
//               const destination = type === 'departures' ? 
//                                 ($el.find('.destination, .to, .dest, td:nth-child(3)').text().trim() || 'N/A') : 
//                                 'Bengaluru (BLR)';
//               const scheduledTime = formatTime($el.find('.scheduled, .time, .departure-time, .arrival-time, td:nth-child(4)').text());
//               const status = $el.find('.status, .flight-status, td:nth-child(5)').text().trim() || 'Scheduled';
//               const terminal = $el.find('.terminal, .gate, td:nth-child(6)').text().trim() || 'T1';

//               if (airline) {
//                 flights.push({
//                   flightNumber,
//                   airline,
//                   origin,
//                   destination,
//                   scheduledTime,
//                   estimatedTime: '',
//                   status,
//                   terminal
//                 });
//               }
//             });

//             if (flights.length > 0) {
//               console.log(`✅ ${source.name} successful with selector ${selector}: found ${flights.length} flights`);
//               return flights;
//             }
//           }
//         }
//       }
//     } catch (err) {
//       console.log(`❌ ${source.name} failed: ${err.message}`);
//       continue;
//     }
//   }

//   return [];
// }



// // Get mock flight data as final fallback
// function getMockFlightData(type, selectedDate = null) {
//   try {
//     console.log(`📋 Using mock flight data for ${type}...`);
//     const allMockFlights = getFlightsByType(type, 'BLR');
    
//     // Shuffle and get only 20 random flights
//     const shuffledFlights = allMockFlights.sort(() => Math.random() - 0.5);
//     const limitedFlights = shuffledFlights.slice(0, 20);
    
//     console.log('🔍 Debug - Sample flight from mock data:', limitedFlights[0]);
    
//     // Map mock data to the expected format
//     const mappedFlights = limitedFlights.map(flight => {
//       const formattedScheduled = formatMockTime(flight.scheduledTime);
//       const formattedEstimated = formatMockTime(flight.estimatedTime);
      
//       console.log('🔍 Debug - Flight times:', {
//         original: { scheduled: flight.scheduledTime, estimated: flight.estimatedTime },
//         formatted: { scheduled: formattedScheduled, estimated: formattedEstimated }
//       });
      
//       return {
//         flightNumber: flight.flightNumber || '',
//         airline: flight.airline || '',
//         airlineImg: '',
//         origin: type === 'departures' ? 'Bengaluru (BLR)' : `${flight.originCity} (${flight.origin})`,
//         destination: type === 'departures' ? `${flight.destinationCity} (${flight.destination})` : 'Bengaluru (BLR)',
//         scheduledTime: formattedScheduled || '',
//         estimatedTime: formattedEstimated || '',
//         status: flight.status || 'Scheduled',
//         terminal: flight.terminal || 'T1',
//         type: type === 'departures' ? 'departure' : 'arrival',
//         date: selectedDate || new Date().toISOString().split('T')[0] // Use selected date or today
//       };
//     });
    
//     console.log(`✅ Mock data successful: found ${mappedFlights.length} flights (limited to 20) for date: ${selectedDate || 'today'}`);
//     return mappedFlights;
//   } catch (err) {
//     console.error('❌ Mock data failed:', err.message);
//     return [];
//   }
// }

// // Scrape BLR departures with real-time data
// export async function scrapeBLRDepartures(destAirport = 'ALL', selectedDate = null) {
//   try {
//     console.log('🔍 Attempting to get REAL-TIME BLR departure data...');
    
//     // Try multiple real-time sources
//     const realTimeFlights = await tryMultipleRealTimeSources('departures');
    
//     if (realTimeFlights.length > 0) {
//       console.log(`✅ Successfully got ${realTimeFlights.length} REAL-TIME departure flights!`);
//       return realTimeFlights.map(flight => mapScrapedFlight(flight, 'departure'));
//     }
    
//     // Fallback: Use mock data
//     console.log('🔄 No real-time data available, using mock data...');
//     return getMockFlightData('departures', selectedDate);
    
//   } catch (err) {
//     console.error('❌ BLR departures scraping failed:', err.message);
//     console.log('🔄 Falling back to mock data...');
//     return getMockFlightData('departures', selectedDate);
//   }
// }

// // Scrape BLR arrivals with real-time data
// export async function scrapeBLRArrivals(orgAirport = 'ALL', selectedDate = null) {
//   try {
//     console.log('🔍 Attempting to get REAL-TIME BLR arrival data...');
    
//     // Try multiple real-time sources
//     const realTimeFlights = await tryMultipleRealTimeSources('arrivals');
    
//     if (realTimeFlights.length > 0) {
//       console.log(`✅ Successfully got ${realTimeFlights.length} REAL-TIME arrival flights!`);
//       return realTimeFlights.map(flight => mapScrapedFlight(flight, 'arrival'));
//     }
    
//     // Fallback: Use mock data
//     console.log('🔄 No real-time data available, using mock data...');
//     return getMockFlightData('arrivals', selectedDate);
    
//   } catch (err) {
//     console.error('❌ BLR arrivals scraping failed:', err.message);
//     console.log('🔄 Falling back to mock data...');
//     return getMockFlightData('arrivals', selectedDate);
//   }
// }


import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class AviationStack {
    constructor() {
        this.apiKey = process.env.AVIATION_STACK_API_KEY;
        if (!this.apiKey) {
            console.warn("Aviation Stack API key not found. Please set AVIATION_STACK_API_KEY in your .env file.");
        }
        this.baseURL = 'http://api.aviationstack.com/v1/';
    }

    async getFlights(params = {}) {
        try {
            // Check for API key first
            if (!this.apiKey) {
                throw new Error("Missing Aviation Stack API Key. Please set AVIATION_STACK_API_KEY in your .env file.");
            }

            console.log('Fetching flights from AviationStack...', { params });

            const response = await axios.get(`${this.baseURL}flights`, {
                params: {
                    access_key: this.apiKey,
                    limit: 100,
                    ...params
                }
            });
            
            if (!response.data) {
                throw new Error('No data received from AviationStack API');
            }

            if (response.data.error) {
                throw new Error(`AviationStack API Error: ${response.data.error.message}`);
            }

            const flights = response.data.data || [];
            console.log(`Successfully fetched ${flights.length} flights`);

            if (!Array.isArray(flights)) {
                throw new Error('Invalid data format received from API');
            }

            const mappedFlights = flights.map(flight => ({
                flightNumber: flight.flight.iata || flight.flight.icao,
                airline: flight.airline.name,
                destination: flight.arrival.airport,
                destinationIata: flight.arrival.iata,
                origin: flight.departure.airport,
                originIata: flight.departure.iata,
                scheduledDeparture: flight.departure.scheduled,
                scheduledArrival: flight.arrival.scheduled,
                actualDeparture: flight.departure.actual || flight.departure.estimated,
                actualArrival: flight.arrival.actual || flight.arrival.estimated,
                status: flight.flight_status,
                gate: flight.departure.gate || flight.arrival.gate,
                terminal: flight.departure.terminal || flight.arrival.terminal,
                delay: flight.departure.delay || flight.arrival.delay || 0
            }));

            return {
                success: true,
                data: mappedFlights
            };

        } catch (error) {
            console.error('AviationStack API Error:', error);
            throw error;
        }
    }
}

export default new AviationStack();

