// Mock Flight Database - 2000 flights from Bangalore to all major Indian airports
// Each flight has realistic data with proper scheduling and routing

const airlines = [
  { code: 'AI', name: 'Air India' },
  { code: '6E', name: 'IndiGo' },
  { code: 'SG', name: 'SpiceJet' },
  { code: 'UK', name: 'Vistara' },
  { code: 'G8', name: 'GoAir' },
  { code: 'I5', name: 'AirAsia India' },
  { code: '9W', name: 'Jet Airways' },
  { code: 'AK', name: 'AirAsia' }
];

const airports = [
  { code: 'DEL', name: 'Delhi', city: 'Delhi' },
  { code: 'BOM', name: 'Mumbai', city: 'Mumbai' },
  { code: 'HYD', name: 'Hyderabad', city: 'Hyderabad' },
  { code: 'MAA', name: 'Chennai', city: 'Chennai' },
  { code: 'CCU', name: 'Kolkata', city: 'Kolkata' },
  { code: 'PNQ', name: 'Pune', city: 'Pune' },
  { code: 'AMD', name: 'Ahmedabad', city: 'Ahmedabad' },
  { code: 'JAI', name: 'Jaipur', city: 'Jaipur' },
  { code: 'LKO', name: 'Lucknow', city: 'Lucknow' },
  { code: 'VNS', name: 'Varanasi', city: 'Varanasi' },
  { code: 'PAT', name: 'Patna', city: 'Patna' },
  { code: 'GAU', name: 'Guwahati', city: 'Guwahati' },
  { code: 'IXZ', name: 'Port Blair', city: 'Port Blair' },
  { code: 'TRV', name: 'Thiruvananthapuram', city: 'Thiruvananthapuram' },
  { code: 'COK', name: 'Kochi', city: 'Kochi' },
  { code: 'CCJ', name: 'Calicut', city: 'Calicut' },
  { code: 'MNG', name: 'Mangalore', city: 'Mangalore' },
  { code: 'IXE', name: 'Mangalore', city: 'Mangalore' },
  { code: 'GOI', name: 'Goa', city: 'Goa' },
  { code: 'BHO', name: 'Bhopal', city: 'Bhopal' },
  { code: 'IDR', name: 'Indore', city: 'Indore' },
  { code: 'NAG', name: 'Nagpur', city: 'Nagpur' },
  { code: 'RPR', name: 'Raipur', city: 'Raipur' },
  { code: 'BHJ', name: 'Bhuj', city: 'Bhuj' },
  { code: 'JDH', name: 'Jodhpur', city: 'Jodhpur' },
  { code: 'UDR', name: 'Udaipur', city: 'Udaipur' },
  { code: 'JSA', name: 'Jaisalmer', city: 'Jaisalmer' },
  { code: 'BKB', name: 'Bikaner', city: 'Bikaner' },
  { code: 'KNU', name: 'Kanpur', city: 'Kanpur' },
  { code: 'VNS', name: 'Varanasi', city: 'Varanasi' },
  { code: 'GAY', name: 'Gaya', city: 'Gaya' },
  { code: 'RNC', name: 'Ranchi', city: 'Ranchi' },
  { code: 'JRG', name: 'Jharsuguda', city: 'Jharsuguda' },
  { code: 'BBI', name: 'Bhubaneswar', city: 'Bhubaneswar' },
  { code: 'VTZ', name: 'Visakhapatnam', city: 'Visakhapatnam' },
  { code: 'VGA', name: 'Vijayawada', city: 'Vijayawada' },
  { code: 'TIR', name: 'Tirupati', city: 'Tirupati' },
  { code: 'CJB', name: 'Coimbatore', city: 'Coimbatore' },
  { code: 'TRZ', name: 'Tiruchirappalli', city: 'Tiruchirappalli' },
  { code: 'IXM', name: 'Madurai', city: 'Madurai' },
  { code: 'TCR', name: 'Tuticorin', city: 'Tuticorin' },
  { code: 'IXJ', name: 'Jammu', city: 'Jammu' },
  { code: 'SXR', name: 'Srinagar', city: 'Srinagar' },
  { code: 'IXL', name: 'Leh', city: 'Leh' },
  { code: 'DHM', name: 'Dharamshala', city: 'Dharamshala' },
  { code: 'KUU', name: 'Kullu', city: 'Kullu' },
  { code: 'DED', name: 'Dehradun', city: 'Dehradun' },
  { code: 'PGH', name: 'Pantnagar', city: 'Pantnagar' },
  { code: 'IXD', name: 'Allahabad', city: 'Allahabad' },
  { code: 'VNS', name: 'Varanasi', city: 'Varanasi' },
  { code: 'KNU', name: 'Kanpur', city: 'Kanpur' },
  { code: 'LKO', name: 'Lucknow', city: 'Lucknow' },
  { code: 'GOP', name: 'Gorakhpur', city: 'Gorakhpur' },
  { code: 'BHR', name: 'Bharatpur', city: 'Bharatpur' },
  { code: 'KQH', name: 'Kishangarh', city: 'Kishangarh' },
  { code: 'JAI', name: 'Jaipur', city: 'Jaipur' },
  { code: 'UDR', name: 'Udaipur', city: 'Udaipur' },
  { code: 'JDH', name: 'Jodhpur', city: 'Jodhpur' },
  { code: 'JSA', name: 'Jaisalmer', city: 'Jaisalmer' },
  { code: 'BKB', name: 'Bikaner', city: 'Bikaner' },
  { code: 'BOM', name: 'Mumbai', city: 'Mumbai' },
  { code: 'PNQ', name: 'Pune', city: 'Pune' },
  { code: 'NAG', name: 'Nagpur', city: 'Nagpur' },
  { code: 'RPR', name: 'Raipur', city: 'Raipur' },
  { code: 'BHO', name: 'Bhopal', city: 'Bhopal' },
  { code: 'IDR', name: 'Indore', city: 'Indore' },
  { code: 'BHJ', name: 'Bhuj', city: 'Bhuj' },
  { code: 'AMD', name: 'Ahmedabad', city: 'Ahmedabad' },
  { code: 'VNS', name: 'Varanasi', city: 'Varanasi' },
  { code: 'PAT', name: 'Patna', city: 'Patna' },
  { code: 'GAY', name: 'Gaya', city: 'Gaya' },
  { code: 'RNC', name: 'Ranchi', city: 'Ranchi' },
  { code: 'JRG', name: 'Jharsuguda', city: 'Jharsuguda' },
  { code: 'BBI', name: 'Bhubaneswar', city: 'Bhubaneswar' },
  { code: 'VTZ', name: 'Visakhapatnam', city: 'Visakhapatnam' },
  { code: 'VGA', name: 'Vijayawada', city: 'Vijayawada' },
  { code: 'TIR', name: 'Tirupati', city: 'Tirupati' },
  { code: 'HYD', name: 'Hyderabad', city: 'Hyderabad' },
  { code: 'BLR', name: 'Bangalore', city: 'Bangalore' },
  { code: 'MAA', name: 'Chennai', city: 'Chennai' },
  { code: 'CJB', name: 'Coimbatore', city: 'Coimbatore' },
  { code: 'TRZ', name: 'Tiruchirappalli', city: 'Tiruchirappalli' },
  { code: 'IXM', name: 'Madurai', city: 'Madurai' },
  { code: 'TCR', name: 'Tuticorin', city: 'Tuticorin' },
  { code: 'MNG', name: 'Mangalore', city: 'Mangalore' },
  { code: 'IXE', name: 'Mangalore', city: 'Mangalore' },
  { code: 'GOI', name: 'Goa', city: 'Goa' },
  { code: 'TRV', name: 'Thiruvananthapuram', city: 'Thiruvananthapuram' },
  { code: 'COK', name: 'Kochi', city: 'Kochi' },
  { code: 'CCJ', name: 'Calicut', city: 'Calicut' },
  { code: 'CCU', name: 'Kolkata', city: 'Kolkata' },
  { code: 'GAU', name: 'Guwahati', city: 'Guwahati' },
  { code: 'IXZ', name: 'Port Blair', city: 'Port Blair' },
  { code: 'IXJ', name: 'Jammu', city: 'Jammu' },
  { code: 'SXR', name: 'Srinagar', city: 'Srinagar' },
  { code: 'IXL', name: 'Leh', city: 'Leh' },
  { code: 'DHM', name: 'Dharamshala', city: 'Dharamshala' },
  { code: 'KUU', name: 'Kullu', city: 'Kullu' },
  { code: 'DED', name: 'Dehradun', city: 'Dehradun' },
  { code: 'PGH', name: 'Pantnagar', city: 'Pantnagar' },
  { code: 'IXD', name: 'Allahabad', city: 'Allahabad' },
  { code: 'GOP', name: 'Gorakhpur', city: 'Gorakhpur' },
  { code: 'BHR', name: 'Bharatpur', city: 'Bharatpur' },
  { code: 'KQH', name: 'Kishangarh', city: 'Kishangarh' }
];

// Generate flight number based on airline
function generateFlightNumber(airlineCode) {
  const number = Math.floor(Math.random() * 999) + 100;
  return `${airlineCode}${number}`;
}

// Generate time based on current date and hour
function generateTime(hour, minute = 0) {
  // Ensure hour and minute are within valid ranges
  hour = hour % 24;
  minute = minute % 60;
  
  // Convert to 12-hour format
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  
  // Format as "10:30 AM" or "2:15 PM"
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

// Generate flight status
function generateStatus() {
  const statuses = ['On Time', 'Delayed', 'Boarding', 'Departed', 'Arrived', 'Scheduled'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Generate terminal
function generateTerminal() {
  const terminals = ['T1', 'T2', 'T3'];
  return terminals[Math.floor(Math.random() * terminals.length)];
}

// Generate mock flights database
function generateMockFlights() {
  const flights = [];
  let flightId = 1;

  // Generate flights for each airport pair (BLR to all other airports)
  airports.forEach(destAirport => {
    if (destAirport.code === 'BLR') return; // Skip BLR to BLR

    // Generate 40-60 flights per route (morning, afternoon, evening, night)
    const flightsPerRoute = Math.floor(Math.random() * 20) + 40;
    
    for (let i = 0; i < flightsPerRoute; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNumber = generateFlightNumber(airline.code);
      
      // Generate departure time (spread throughout the day)
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const scheduledTime = generateTime(hour, minute);
      
      // Generate estimated time (same or slightly different)
      const estimatedHour = hour + (Math.random() > 0.8 ? 1 : 0);
      const estimatedMinute = minute + (Math.random() > 0.8 ? Math.floor(Math.random() * 30) : 0);
      const estimatedTime = generateTime(estimatedHour, estimatedMinute);
      
      const flight = {
        id: flightId++,
        flightNumber: flightNumber,
        airline: airline.name,
        airlineCode: airline.code,
        origin: 'BLR',
        originCity: 'Bangalore',
        originAirport: 'Kempegowda International Airport',
        destination: destAirport.code,
        destinationCity: destAirport.city,
        destinationAirport: `${destAirport.city} Airport`,
        scheduledTime: scheduledTime,
        estimatedTime: estimatedTime,
        status: generateStatus(),
        terminal: generateTerminal(),
        type: 'departure',
        date: new Date().toISOString().split('T')[0] // Today's date
      };
      
      flights.push(flight);
    }
  });

  // Generate return flights (from other airports to BLR)
  airports.forEach(originAirport => {
    if (originAirport.code === 'BLR') return; // Skip BLR to BLR

    // Generate 30-50 return flights per route
    const flightsPerRoute = Math.floor(Math.random() * 20) + 30;
    
    for (let i = 0; i < flightsPerRoute; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNumber = generateFlightNumber(airline.code);
      
      // Generate arrival time
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const scheduledTime = generateTime(hour, minute);
      
      const estimatedHour = hour + (Math.random() > 0.8 ? 1 : 0);
      const estimatedMinute = minute + (Math.random() > 0.8 ? Math.floor(Math.random() * 30) : 0);
      const estimatedTime = generateTime(estimatedHour, estimatedMinute);
      
      const flight = {
        id: flightId++,
        flightNumber: flightNumber,
        airline: airline.name,
        airlineCode: airline.code,
        origin: originAirport.code,
        originCity: originAirport.city,
        originAirport: `${originAirport.city} Airport`,
        destination: 'BLR',
        destinationCity: 'Bangalore',
        destinationAirport: 'Kempegowda International Airport',
        scheduledTime: scheduledTime,
        estimatedTime: estimatedTime,
        status: generateStatus(),
        terminal: generateTerminal(),
        type: 'arrival',
        date: new Date().toISOString().split('T')[0] // Today's date
      };
      
      flights.push(flight);
    }
  });

  return flights;
}

// Generate flights for different dates (today, tomorrow, day after)
function generateFlightsForDates() {
  const allFlights = [];
  const dates = [
    new Date().toISOString().split('T')[0], // Today
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Day after tomorrow
  ];

  dates.forEach(date => {
    const flightsForDate = generateMockFlights();
    flightsForDate.forEach(flight => {
      flight.date = date;
    });
    allFlights.push(...flightsForDate);
  });

  return allFlights;
}

// Export the mock flights database
export const mockFlightsDatabase = generateFlightsForDates();

// Helper function to search flights
export function searchFlights(from, to, date) {
  return mockFlightsDatabase.filter(flight => {
    const matchesFrom = !from || flight.origin === from.toUpperCase();
    const matchesTo = !to || flight.destination === to.toUpperCase();
    const matchesDate = !date || flight.date === date;
    
    return matchesFrom && matchesTo && matchesDate;
  });
}

// Helper function to get flights by type (departures/arrivals)
export function getFlightsByType(type, airport = 'BLR') {
  return mockFlightsDatabase.filter(flight => {
    if (type === 'departures') {
      return flight.origin === airport && flight.type === 'departure';
    } else if (type === 'arrivals') {
      return flight.destination === airport && flight.type === 'arrival';
    }
    return false;
  });
}

export default mockFlightsDatabase; 