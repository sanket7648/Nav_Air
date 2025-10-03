import React, { useState, useMemo } from 'react';
import { 
  Palette, 
  MapPin, 
  Eye, 
  Heart, 
  Share2,
  Filter,
  Search,
  Smartphone,
  Camera,
  Info,
  ChevronDown // Added ChevronDown for select
} from 'lucide-react';
import Footer from '../components/Footer';
import ALL_AIRPORT_ARTWORKS, { Artwork, AirportArtData } from '../data/artworks'; // Import external data

export const ArtGuidePage: React.FC = () => {
  // Initialize with the first airport's ID from the mock data
  const [selectedAirportId, setSelectedAirportId] = useState(ALL_AIRPORT_ARTWORKS[0]?.airportId || '');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [likedArtworks, setLikedArtworks] = useState<string[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);

  // Get the currently selected airport's data
  const currentAirportData = useMemo(() => {
    // Simulates fetching data by airport ID
    return ALL_AIRPORT_ARTWORKS.find(a => a.airportId === selectedAirportId) || { artworks: [] as Artwork[] };
  }, [selectedAirportId]);

  // --- Filtering Logic (now based on currentAirportData.artworks) ---
  const filteredArtworks = useMemo(() => {
    let artworks = currentAirportData.artworks;

    // 1. Filter by Category
    if (selectedFilter !== 'all') {
        artworks = artworks.filter(artwork => artwork.category === selectedFilter);
    }
    
    // 2. Filter by Search Term
    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        artworks = artworks.filter(artwork => 
            artwork.title.toLowerCase().includes(lowerSearchTerm) ||
            artwork.artist.toLowerCase().includes(lowerSearchTerm)
        );
    }

    return artworks;
  }, [currentAirportData, selectedFilter, searchTerm]);
  // --- End Filtering Logic ---

  const filters = [
    { key: 'all', label: 'All Artworks' },
    { key: 'digital', label: 'Digital' },
    { key: 'sculpture', label: 'Sculpture' },
    { key: 'installation', label: 'Installation' },
    { key: 'painting', label: 'Painting' },
    { key: 'mosaic', label: 'Mosaic' },
  ];

  const toggleLike = (artworkId: string) => {
    setLikedArtworks(prev => 
      prev.includes(artworkId) 
        ? prev.filter(id => id !== artworkId)
        : [...prev, artworkId]
    );
  };

  const getGridClass = (index: number) => {
    const patterns = [
      'row-span-2', 'row-span-1', 'row-span-2',
      'row-span-1', 'row-span-2', 'row-span-1',
    ];
    return patterns[index % patterns.length];
  };

  const selectedArtworkDetails = useMemo(() => {
      // Find the artwork in the current airport's data
      return currentAirportData.artworks.find(a => a.id === selectedArtwork);
  }, [selectedArtwork, currentAirportData]);


  return (
    <>
      {/* The background is now a pink-only gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-100 to-pink-300 -z-10" />
      
      {/* The original container now just handles content layout, without its own background */}
      <div className="flex flex-col items-center py-6 sm:py-12 px-2 sm:px-0 pt-[100px] sm:pt-[100px] md:pb-[200px]">
        {/* Header */}
        <div className="mb-3 max-w-5xl w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5">Art & Culture Guide</h2>
        </div>
        
        {/* --- Airport Selector --- */}
        <div className="mb-3 max-w-5xl w-full">
            <label htmlFor="airport-selector" className="block text-sm font-medium text-gray-700 mb-1">
                Select Airport
            </label>
            <div className="relative">
                <select
                    id="airport-selector"
                    value={selectedAirportId}
                    onChange={(e) => {
                        setSelectedAirportId(e.target.value);
                        setSelectedFilter('all'); // Reset filters on airport change
                        setSearchTerm('');
                    }}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-semibold bg-white"
                >
                    {ALL_AIRPORT_ARTWORKS.map((airport) => (
                        <option key={airport.airportId} value={airport.airportId}>
                            {airport.airportName}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
        </div>
        {/* --- END Airport Selector --- */}

        {/* Search */}
        <div className="mb-3 max-w-5xl w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search artworks or artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        {/* Filters */}
        <div className="mb-3 max-w-5xl w-full">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Artworks Grid */}
        <div className="grid grid-cols-2 gap-2 auto-rows-[120px] max-w-5xl w-full">
        {filteredArtworks.length > 0 ? (
          filteredArtworks.map((artwork, index) => (
            <div
              key={artwork.id}
              className={`${getGridClass(index)} bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group cursor-pointer`}
              onClick={() => setSelectedArtwork(artwork.id)}
            >
              <div className="relative h-full">
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {artwork.hasAR && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                      <Smartphone className="w-3 h-3 inline mr-0.5" />
                      AR
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm mb-1">{artwork.title}</h3>
                      <p className="text-white/80 text-xs mb-2">{artwork.artist}</p>
                      <div className="flex items-center space-x-1 text-white/70 text-xs">
                        <MapPin className="w-3 h-3" />
                        <span>{artwork.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(artwork.id); }}
                        className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${likedArtworks.includes(artwork.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
             <div className="col-span-2 text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                <Palette className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No artwork found for the selected airport or filter.</p>
             </div>
        )}
        </div>

        {/* Artwork Detail Modal */}
        {selectedArtwork && selectedArtworkDetails && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
            <div className="bg-white rounded-t-3xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{selectedArtworkDetails.title}</h3>
                  <button onClick={() => setSelectedArtwork(null)} className="p-2 hover:bg-gray-100 rounded-full">×</button>
                </div>
                <img src={selectedArtworkDetails.image} alt={selectedArtworkDetails.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Artist</h4>
                    <p className="text-gray-600">{selectedArtworkDetails.artist}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{selectedArtworkDetails.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Year</h4>
                      <p className="text-gray-600">{selectedArtworkDetails.year}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Medium</h4>
                      <p className="text-gray-600">{selectedArtworkDetails.medium}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{selectedArtworkDetails.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4 mt-6">
                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    <MapPin className="w-4 h-4 mr-2 inline" />
                    Get Directions
                  </button>
                  {selectedArtworkDetails.hasAR && (
                    <button className="flex-1 bg-yellow-400 text-yellow-900 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
                      <Smartphone className="w-4 h-4 mr-2 inline" />
                      View in AR
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 max-w-5xl w-full">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Stats for {currentAirportData.airportName || 'Selected Airport'}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentAirportData.artworks.length}</div>
                <div className="text-sm text-gray-600">Total Artworks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentAirportData.artworks.filter(a => a.hasAR).length}</div>
                <div className="text-sm text-gray-600">AR Enabled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{likedArtworks.length}</div>
                <div className="text-sm text-gray-600">Favorites</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Place Footer at the bottom of the page */}
      <Footer />
    </>
  );
};