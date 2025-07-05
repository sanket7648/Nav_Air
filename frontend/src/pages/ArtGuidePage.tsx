import React, { useState } from 'react';
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
  Info
} from 'lucide-react';

export const ArtGuidePage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [likedArtworks, setLikedArtworks] = useState<string[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);

  const artworks = [
    {
      id: '1',
      title: 'Sky Reflections',
      artist: 'Maria Santos',
      description: 'A stunning installation capturing the movement of clouds and sky through interactive digital displays.',
      location: 'Terminal 3, Gate B Area',
      category: 'digital',
      image: 'https://images.pexels.com/photos/1153213/pexels-photo-1153213.jpeg?auto=compress&cs=tinysrgb&w=400',
      year: '2023',
      medium: 'Digital Installation',
      hasAR: true
    },
    {
      id: '2',
      title: 'Ocean Waves',
      artist: 'David Chen',
      description: 'Bronze sculpture inspired by the Pacific Ocean waves, symbolizing the connection between land and sea.',
      location: 'Terminal 1, Main Concourse',
      category: 'sculpture',
      image: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=400',
      year: '2022',
      medium: 'Bronze',
      hasAR: false
    },
    {
      id: '3',
      title: 'Journey of Light',
      artist: 'Elena Rodriguez',
      description: 'A mesmerizing light installation that changes throughout the day, representing the journey of travelers.',
      location: 'Terminal 2, Security Checkpoint',
      category: 'installation',
      image: 'https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=400',
      year: '2024',
      medium: 'LED Installation',
      hasAR: true
    },
    {
      id: '4',
      title: 'Cultural Mosaic',
      artist: 'Ahmed Hassan',
      description: 'A vibrant mosaic representing the diversity of cultures that pass through San Francisco.',
      location: 'Terminal 3, Baggage Claim',
      category: 'mosaic',
      image: 'https://images.pexels.com/photos/1187079/pexels-photo-1187079.jpeg?auto=compress&cs=tinysrgb&w=400',
      year: '2021',
      medium: 'Ceramic Mosaic',
      hasAR: false
    },
    {
      id: '5',
      title: 'Wings of Freedom',
      artist: 'Sarah Kim',
      description: 'Abstract painting series depicting the freedom of flight and human aspiration.',
      location: 'Terminal 1, Gate A Area',
      category: 'painting',
      image: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=400',
      year: '2023',
      medium: 'Oil on Canvas',
      hasAR: true
    },
    {
      id: '6',
      title: 'Digital Horizon',
      artist: 'Tech Collective',
      description: 'Interactive digital artwork that responds to passenger movement and creates unique visual experiences.',
      location: 'Terminal 2, Food Court',
      category: 'digital',
      image: 'https://images.pexels.com/photos/1153213/pexels-photo-1153213.jpeg?auto=compress&cs=tinysrgb&w=400',
      year: '2024',
      medium: 'Interactive Display',
      hasAR: true
    },
  ];

  const filters = [
    { key: 'all', label: 'All Artworks' },
    { key: 'digital', label: 'Digital' },
    { key: 'sculpture', label: 'Sculpture' },
    { key: 'installation', label: 'Installation' },
    { key: 'painting', label: 'Painting' },
    { key: 'mosaic', label: 'Mosaic' },
  ];

  const filteredArtworks = artworks.filter(artwork => {
    const matchesFilter = selectedFilter === 'all' || artwork.category === selectedFilter;
    const matchesSearch = artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artwork.artist.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleLike = (artworkId: string) => {
    setLikedArtworks(prev => 
      prev.includes(artworkId) 
        ? prev.filter(id => id !== artworkId)
        : [...prev, artworkId]
    );
  };

  const getGridClass = (index: number) => {
    // Create a masonry-like effect with varying heights
    const patterns = [
      'row-span-2',
      'row-span-1',
      'row-span-2',
      'row-span-1',
      'row-span-2',
      'row-span-1',
    ];
    return patterns[index % patterns.length];
  };

  return (
    // Change pt-32 to pt-24 for a more standard navbar height (adjust as needed)
    <div className="pt-36 px-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Art & Culture Guide</h2>
        <p className="text-gray-600">Discover the artistic treasures of SFO</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search artworks or artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
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
      <div className="grid grid-cols-2 gap-4 auto-rows-[200px]">
        {filteredArtworks.map((artwork, index) => (
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
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* AR Badge */}
              {artwork.hasAR && (
                <div className="absolute top-3 right-3">
                  <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                    <Smartphone className="w-3 h-3 inline mr-1" />
                    AR
                  </div>
                </div>
              )}
              
              {/* Content */}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(artwork.id);
                      }}
                      className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${
                        likedArtworks.includes(artwork.id) ? 'text-red-500 fill-red-500' : 'text-white'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Artwork Detail Modal */}
      {selectedArtwork && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
          <div className="bg-white rounded-t-3xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            {(() => {
              const artwork = artworks.find(a => a.id === selectedArtwork);
              if (!artwork) return null;
              
              return (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{artwork.title}</h3>
                    <button
                      onClick={() => setSelectedArtwork(null)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                  
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Artist</h4>
                      <p className="text-gray-600">{artwork.artist}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{artwork.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Year</h4>
                        <p className="text-gray-600">{artwork.year}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Medium</h4>
                        <p className="text-gray-600">{artwork.medium}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{artwork.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      <MapPin className="w-4 h-4 mr-2 inline" />
                      Get Directions
                    </button>
                    {artwork.hasAR && (
                      <button className="flex-1 bg-yellow-400 text-yellow-900 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
                        <Smartphone className="w-4 h-4 mr-2 inline" />
                        View in AR
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{artworks.length}</div>
            <div className="text-sm text-gray-600">Artworks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{artworks.filter(a => a.hasAR).length}</div>
            <div className="text-sm text-gray-600">AR Enabled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{likedArtworks.length}</div>
            <div className="text-sm text-gray-600">Favorites</div>
          </div>
        </div>
      </div>
    </div>
  );
};