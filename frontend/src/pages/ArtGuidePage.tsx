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
import Footer from '../components/Footer';

export const ArtGuidePage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [likedArtworks, setLikedArtworks] = useState<string[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);

  const artworks = [
    {
      id: '1',
      title: 'Mudra Installation',
      artist: 'Ayush Kasliwal and Incubis Consultants',
      description: 'Iconic installation featuring 12 monumental hand gestures (mudras) cast in fiberglass and copper, symbolizing Indian dance and yoga traditions. The hands are posed against a backdrop of spun copper discs and stretch across a 240-meter “canyon wall.',
      location: 'Terminal 3, Canyon Wall',
      category: 'digital',
      image: 'https://images.squarespace-cdn.com/content/v1/5e8f61083a0eb92736ab4f1f/1588146620291-O6DHPT9ZZJ11PR047OZ3/Canyon%2BWall%252C%2BT3%252C%2BIGI%2BAirport%252C%2BDelhi%252C%2B2012%2B-2%2B-%2BCopy.jpg',
      year: '2010',
      medium: 'Digital Installation',
      hasAR: true
    },
    {
      id: '2',
      title: 'Sound of Silence',
      artist: 'Paresh Maity',
      description: 'A mesmerizing installation comprising 4,500 brass bells, evoking a sense of harmony and stillness, celebrating travel and unity.',
      location: 'Terminal 1, Arrivals',
      category: 'sculpture',
      image: 'https://i.pinimg.com/736x/74/26/50/742650a3e705232b3ca5c16e3b156d84.jpg',
      year: '2024',
      medium: 'Brass bells (installation)',
      hasAR: false
    },
    {
      id: '3',
      title: 'Lightning',
      artist: 'M.F. Husain',
      description: 'Large-scale narrative murals blending modern art with Indian history, connecting domestic and international sections.',
      location: 'Terminal 2, Security Checkpoint',
      category: 'installation',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_VRPmKs6Z6r9Gs0io_sRbL7ihghhYl-QODA&s',
      year: '2010',
      medium: 'Acrylic on canvas, mural',
      hasAR: true
    },
    {
      id: '4',
      title: 'Surya Namaskar',
      artist: 'Satish Gupta',
      description: 'Satish Gupta',
      location: 'Terminal 3 (Arrivals Corridor/Departure Pier)',
      category: 'mosaic',
      image: 'https://media.fortuneindia.com/fortune-india/import/2018-01/efff585d-4a17-486e-b7cc-574f947b4b9f/Airport-Art-Story-1-(1)-(1).JPG?rect=0,38,1250,703&w=640&auto=format,compress&fit=max&q=80',
      year: '2010',
      medium: 'Mixed metals',
      hasAR: false
    },
    {
      id: '5',
      title: 'Ball of Joy',
      artist: 'Sumeet Dua',
      description: 'A striking, 13 foot tall steel sculpture depicting two abstract human figures, placed at the main entrance roundabout to greet arriving travelers. Meant to symbolize joy, unity, and the universal spirit of journey.',
      location: 'Terminal 1, Gate A Area',
      category: 'Steel sculpture',
      image: 'https://images.tribuneindia.com/cms/gall_content/2019/4/2019_4$largeimg17_Wednesday_2019_080028322.jpg',
      year: '2019 ',
      medium: 'Steel sculpture',
      hasAR: true
    },
    {
      id: '6',
      title: 'Golden Temple Mural',
      artist: 'Punjab Lalit Kala Akademi ',
      description: 'A large-scale painted mural of the revered Golden Temple (Harmandir Sahib) rendered on an interior wall, featuring gold toned hues that reflect the temple’s spiritual ambience. Adds a serene visual focal point.',
      location: 'Terminal 2, Food Court',
      category: 'digital',
      image: 'https://pbs.twimg.com/media/EheCcKkVgAEdqp5.jpg',
      year: 'Pending Verification',
      medium: 'Acrylic/tempera wall painting',
      hasAR: true
    },
    {
      id: '7',
      title: 'Bronze Bhangra Dancer Sculpture',
      artist: 'Commissioned (name TBD)',
      description: 'A life-size bronze figure of a bhangra dancer captured mid-movement, celebrating Punjabi folk danceculture, prominently installed in the arrivals hall.',
      location: 'Terminal 2, Food Court',
      category: 'digital',
      image: 'https://indiacinehub.gov.in/sites/default/files/styles/flexslider_full/public/2024-03/heritage_street_amritsar6.png?itok=X1_nMwhs',
      year: 'Pending Verification',
      medium: 'Bronze sculpture',
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
    const patterns = [
      'row-span-2', 'row-span-1', 'row-span-2',
      'row-span-1', 'row-span-2', 'row-span-1',
    ];
    return patterns[index % patterns.length];
  };

  return (
    <>
      {/* The background is now a pink-only gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-100 to-pink-300 -z-10" />
      
      {/* The original container now just handles content layout, without its own background */}
      <div className="flex flex-col items-center py-6 sm:py-12 px-2 sm:px-0 pt-[100px] sm:pt-[100px] md:pb-[200px]">
        {/* Header */}
        <div className="mb-3 max-w-5xl w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5">Art & Culture Guide</h2>
          {/*<p className="text-gray-600 text-sm">Discover the artistic treasures of SFO</p>*/}
        </div>
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
                      <button onClick={() => setSelectedArtwork(null)} className="p-2 hover:bg-gray-100 rounded-full">×</button>
                    </div>
                    <img src={artwork.image} alt={artwork.title} className="w-full h-48 object-cover rounded-lg mb-4" />
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
        <div className="mt-8 max-w-5xl w-full">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
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
      </div>
      {/* Place Footer at the bottom of the page */}
      <Footer />
    </>
  );
};

export default ArtGuidePage;