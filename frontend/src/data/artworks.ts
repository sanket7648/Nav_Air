export interface Artwork {
  id: string;
  title: string;
  artist: string;
  description: string;
  location: string;
  category: string;
  image: string;
  year: string;
  medium: string;
  hasAR: boolean;
}

export interface AirportArtData {
  airportId: string;
  airportName: string;
  artworks: Artwork[];
}

// Sample Data Structure: Only the current data is used, but structured under a mock airport ID.
export const ALL_AIRPORT_ARTWORKS: AirportArtData[] = [
  {
    airportId: 'DEL',
    airportName: 'Delhi (DEL) - Indira Gandhi Intl.',
    artworks: [
      {
        id: '1',
        title: 'Mudra Installation',
        artist: 'Ayush Kasliwal and Incubis Consultants',
        description: 'Iconic installation featuring 12 monumental hand gestures (mudras) cast in fiberglass and copper, symbolizing Indian dance and yoga traditions. The hands are posed against a backdrop of spun copper discs and stretch across a 240-meter “canyon wall.',
        location: 'Terminal 3, Canyon Wall',
        category: 'digital',
        image: 'https://images.squarespace-cdn.com/content/v1/5e8f61083a0eb92736ab4f1f/1588146620291-O6DHPT9ZZI11PR047OZ3/Canyon%2BWall%252C%2BT3%252C%2BIGI%2BAirport%252C%2BDelhi%252C%2B2012%2B-2%2B-%2BCopy.jpg',
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
        description: 'A large-scale painted mural of the revered Golden Temple (Harmandir Sahib) rendered on an interior wall, featuring gold toned hues that reflect the temple’s spiritual ambience. Adds a serene visual focal point.',
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
        description: 'A life-size bronze figure of a bhangra dancer captured mid-movement, celebrating Punjabi folk dance culture, prominently installed in the arrivals hall.',
        location: 'Terminal 2, Food Court',
        category: 'digital',
        image: 'https://indiacinehub.gov.in/sites/default/files/styles/flexslider_full/public/2024-03/heritage_street_amritsar6.png?itok=X1_nMwhs',
        year: 'Pending Verification',
        medium: 'Bronze sculpture',
        hasAR: true
      },
    ]
  },
  {
    airportId: 'BLR',
    airportName: 'Bengaluru (BLR) - Kempegowda Intl.',
    artworks: [
      {
        id: 'B1',
        title: 'The Great Banyan Tree',
        artist: 'Various Indian Artists',
        description: 'A massive digital/sculptural recreation of the iconic Banyan tree, serving as a central meeting point and housing cultural displays.',
        location: 'Terminal 2, Central Hall',
        category: 'installation',
        image: 'https://www.deccanherald.com/sites/dh/files/styles/article_detail/public/articleimages/2023/12/17/blrs-t2-1-1282276-1702808035.jpg',
        year: '2023',
        medium: 'Mixed Media, Digital',
        hasAR: true
      },
      {
        id: 'B2',
        title: 'The Hanging Gardens',
        artist: 'Landscape Architects',
        description: 'Vertical gardens and terrariums integrated into the terminal structure, emphasizing sustainability and the "Garden City" theme.',
        location: 'Terminal 2, Check-in Area',
        category: 'installation',
        image: 'https://www.blraviation.com/assets/images/gallery/t2_gallery/t2_img_1.jpg',
        year: '2023',
        medium: 'Living Plants and Structure',
        hasAR: false
      }
    ]
  }
];

// Default export of the data
export default ALL_AIRPORT_ARTWORKS;