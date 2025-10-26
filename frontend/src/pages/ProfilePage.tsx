import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { User, MapPin, Save, ArrowLeft, Camera, Upload, Package, Calendar, Palette, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { authUtils, authAPI, bookingAPI, baggageAPI, artSubmissionAPI } from '../services/api';
import { Link } from 'react-router-dom'; // Use Link for navigation

// Define types for fetched data
interface Booking {
    booking_id: string;
    service_type: string;
    booking_date: string;
    booking_time: string;
    status: string;
    created_at: string;
}

interface BaggageRecord {
    bagId: string;
    flightNumber: string;
    carouselNumber: number;
    currentStatus: string;
    lastTimestamp: number;
    createdAt: string;
}

interface ArtSubmission {
    id: number;
    title: string;
    image_url: string;
    status: string;
    created_at: string;
}

export const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<any>(null); // Consider defining a proper User type matching your AuthContext
    const [loadingUser, setLoadingUser] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({ city: '', country: '' });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    const [baggage, setBaggage] = useState<BaggageRecord[]>([]);
    const [loadingBaggage, setLoadingBaggage] = useState(false);

    const [artSubmissions, setArtSubmissions] = useState<ArtSubmission[]>([]);
    const [loadingArtSubmissions, setLoadingArtSubmissions] = useState(false);
    const [artFormData, setArtFormData] = useState({ title: '', description: '', location: '' });
    const [artFile, setArtFile] = useState<File | null>(null);
    const [artFilePreview, setArtFilePreview] = useState<string | null>(null);
    const [submittingArt, setSubmittingArt] = useState(false);
    const [artSubmitMessage, setArtSubmitMessage] = useState({ type: '', text: '' });
    const artInputRef = useRef<HTMLInputElement>(null);

    const isAuthenticated = authUtils.isAuthenticated();

    // --- Data Fetching Effects ---
    useEffect(() => {
        if (!isAuthenticated) {
            window.location.href = '/login'; // Redirect if not logged in
            return;
        }

        const loadInitialData = async () => {
            setLoadingUser(true);
            setLoadingBookings(true);
            setLoadingBaggage(true);
            setLoadingArtSubmissions(true);

            try {
                // Fetch User Data
                const userData = await authAPI.getCurrentUser();
                setUser(userData);
                setFormData({ city: userData.city || '', country: userData.country || '' });
                if (userData.avatarUrl) {
                    setAvatarPreview(userData.avatarUrl);
                }
            } catch (error) {
                console.error('Error loading user:', error);
                setProfileMessage({ type: 'error', text: 'Failed to load user data' });
            } finally {
                setLoadingUser(false);
            }

            try {
                // Fetch Bookings
                const bookingData = await bookingAPI.getMyBookings();
                setBookings(bookingData);
            } catch (error) {
                console.error('Error loading bookings:', error);
            } finally {
                setLoadingBookings(false);
            }

            try {
                // Fetch Baggage
                const baggageData = await baggageAPI.getMyBaggage();
                setBaggage(baggageData);
            } catch (error) {
                console.error('Error loading baggage:', error);
            } finally {
                setLoadingBaggage(false);
            }

            try {
                // Fetch Art Submissions
                const artData = await artSubmissionAPI.getMySubmissions();
                setArtSubmissions(artData);
            } catch (error) {
                console.error('Error loading art submissions:', error);
            } finally {
                setLoadingArtSubmissions(false);
            }
        };

        loadInitialData();
    }, [isAuthenticated]);

    // --- Handlers ---

    const handleProfileSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileMessage({ type: '', text: '' });
        try {
            await authAPI.updateProfile(formData);
            setUser({ ...user, ...formData });
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        setUploadingAvatar(true);
        setProfileMessage({ type: '', text: '' });
        try {
            const result = await authAPI.uploadAvatar(avatarFile);
            setUser({ ...user, avatarUrl: result.avatarUrl }); // Update user state with new URL
            setAvatarPreview(result.avatarUrl); // Update preview with the actual URL from backend
            setAvatarFile(null); // Clear the file input state
            setProfileMessage({ type: 'success', text: 'Avatar updated successfully!' });
             setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload avatar.' });
            // Optionally revert preview if upload fails
            // setAvatarPreview(user?.avatar_url || null);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleArtFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setArtFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setArtFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

     const handleArtFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setArtFormData({ ...artFormData, [e.target.name]: e.target.value });
    };

    const handleArtSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!artFile) {
            setArtSubmitMessage({ type: 'error', text: 'Please select an image file.' });
            return;
        }
        setSubmittingArt(true);
        setArtSubmitMessage({ type: '', text: '' });
        try {
            await artSubmissionAPI.submitArtwork({
                ...artFormData,
                artworkImage: artFile,
            });
            // Reset form and refetch submissions
            setArtFormData({ title: '', description: '', location: '' });
            setArtFile(null);
            setArtFilePreview(null);
            if (artInputRef.current) artInputRef.current.value = ""; // Clear file input visually
            setArtSubmitMessage({ type: 'success', text: 'Artwork submitted for review!' });
            // Refetch submissions
            setLoadingArtSubmissions(true);
            const artData = await artSubmissionAPI.getMySubmissions();
            setArtSubmissions(artData);
            setLoadingArtSubmissions(false);

            setTimeout(() => setArtSubmitMessage({ type: '', text: '' }), 4000);

        } catch (error: any) {
             setArtSubmitMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit artwork.' });
        } finally {
            setSubmittingArt(false);
        }
    };

    // --- Render Logic ---

    if (!isAuthenticated) {
        return null; // Redirect is handled by useEffect
    }

    if (loadingUser) {
        return (
            <div className="pt-32 px-4 pb-8 max-w-4xl mx-auto flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-600 text-lg">Loading profile...</span>
            </div>
        );
    }

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || user?.email || 'U')}&background=random&color=fff&size=128`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 py-6 sm:py-12 px-2 sm:px-6 pt-[100px] sm:pt-[100px]">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="mb-6 px-4">
                    <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
                    <p className="text-gray-600">Manage your information, bookings, and contributions.</p>
                </div>

                 {/* Profile Message Area */}
                {profileMessage.text && (
                    <div className={`p-3 rounded-lg text-sm mx-4 ${
                         profileMessage.type === 'success'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                         {profileMessage.text}
                    </div>
                )}


                {/* Profile Info & Avatar Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="relative mb-4 group">
                            <img
                                src={avatarPreview || user?.avatarUrl || defaultAvatar}
                                alt="Profile Avatar"
                                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md mx-auto md:mx-0"
                                onError={(e) => { e.currentTarget.src = defaultAvatar }} // Fallback if image fails
                            />
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                aria-label="Change profile picture"
                            >
                                <Camera className="w-8 h-8 text-white" />
                            </button>
                            <input
                                type="file"
                                ref={avatarInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        {avatarFile && !uploadingAvatar && (
                             <button
                                onClick={handleAvatarUpload}
                                className="w-full md:w-auto px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1 mx-auto md:mx-0 mb-2"
                            >
                                <Upload className="w-3 h-3"/> Upload New Avatar
                            </button>
                        )}
                        {uploadingAvatar && (
                             <div className="text-xs text-blue-600 flex items-center justify-center gap-1 mx-auto md:mx-0 mb-2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                Uploading...
                             </div>
                        )}
                        <h2 className="text-xl font-bold text-gray-900 mt-2">{user?.username || 'User'}</h2>
                        <p className="text-gray-600 text-sm">{user?.email}</p>
                    </div>

                    {/* Profile Form Section */}
                    <form onSubmit={handleProfileSubmit} className="space-y-4 md:col-span-2">
                         <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Update Location</h3>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-gray-400" /> City
                            </label>
                            <input
                                type="text"
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                                placeholder="Your city (e.g., London)"
                            />
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-gray-400" /> Country
                            </label>
                            <input
                                type="text"
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                                placeholder="Your country (e.g., United Kingdom)"
                            />
                        </div>
                         <button
                            type="submit"
                            disabled={savingProfile}
                            className="w-full md:w-auto px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            {savingProfile ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Save Changes
                                </>
                            )}
                        </button>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                             <h4 className="font-semibold text-blue-900 text-xs mb-1">Why set your location?</h4>
                            <p className="text-blue-700 text-xs">
                                It helps us show relevant flight updates and regional information.
                            </p>
                        </div>
                    </form>
                </div>

                {/* My Bookings Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                         <Calendar className="w-5 h-5 text-blue-600"/> My Bookings
                    </h3>
                    {loadingBookings ? (
                        <div className="text-center py-6 text-gray-500">Loading bookings...</div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">You have no bookings yet.</div>
                    ) : (
                        <ul className="space-y-3">
                            {bookings.map((booking) => (
                                <li key={booking.booking_id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">{booking.service_type}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                                        </p>
                                        <p className="text-xs text-gray-400">Booked on: {new Date(booking.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`mt-2 sm:mt-0 px-2 py-0.5 rounded-full text-xs font-medium ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {booking.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                 {/* My Baggage Records Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-orange-600"/> My Baggage Records
                    </h3>
                     {loadingBaggage ? (
                        <div className="text-center py-6 text-gray-500">Loading baggage records...</div>
                    ) : baggage.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">You have no baggage records yet. Use the Baggage page to add one.</div>
                    ) : (
                         <ul className="space-y-3">
                            {baggage.map((bag) => (
                                <li key={bag.bagId} className="p-4 bg-orange-50 rounded-lg border border-orange-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                     <div>
                                        <p className="font-semibold text-gray-800">Bag ID: {bag.bagId}</p>
                                        <p className="text-sm text-gray-600">
                                            Flight: {bag.flightNumber} {bag.carouselNumber ? `| Carousel: ${bag.carouselNumber}` : ''}
                                        </p>
                                        <p className="text-xs text-gray-400">Added on: {new Date(bag.createdAt).toLocaleDateString()}</p>
                                    </div>
                                     <span className={`mt-2 sm:mt-0 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800`}>
                                        Status: {bag.currentStatus}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Submit Airport Art Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                     <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                         <Palette className="w-5 h-5 text-purple-600"/> Contribute Airport Art
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Spotted interesting art or craft at the airport? Share it with the community!</p>

                    {artSubmitMessage.text && (
                        <div className={`p-3 rounded-lg text-sm mb-4 ${
                             artSubmitMessage.type === 'success'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                             {artSubmitMessage.text}
                        </div>
                     )}

                    <form onSubmit={handleArtSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="artTitle" className="block text-sm font-medium text-gray-700 mb-1">Artwork Title *</label>
                            <input type="text" id="artTitle" name="title" value={artFormData.title} onChange={handleArtFormChange} required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-sm" />
                        </div>
                        <div>
                            <label htmlFor="artDesc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="artDesc" name="description" value={artFormData.description} onChange={handleArtFormChange} rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-sm" />
                        </div>
                        <div>
                            <label htmlFor="artLoc" className="block text-sm font-medium text-gray-700 mb-1">Location (e.g., Near Gate B5)</label>
                            <input type="text" id="artLoc" name="location" value={artFormData.location} onChange={handleArtFormChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 text-sm" />
                        </div>
                        <div>
                             <label htmlFor="artFile" className="block text-sm font-medium text-gray-700 mb-1">Upload Image *</label>
                             <div className="flex items-center gap-4">
                                <button type="button" onClick={() => artInputRef.current?.click()} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition flex items-center gap-1">
                                    <Upload className="w-3 h-3"/> Choose File
                                </button>
                                <span className="text-xs text-gray-500">{artFile ? artFile.name : 'No file chosen'}</span>
                             </div>
                             <input type="file" id="artFile" ref={artInputRef} onChange={handleArtFileChange} accept="image/*" required className="hidden" />
                             {artFilePreview && (
                                <img src={artFilePreview} alt="Artwork preview" className="mt-3 rounded-lg max-h-40 w-auto border"/>
                             )}
                        </div>

                         <button
                            type="submit"
                            disabled={submittingArt}
                            className="w-full md:w-auto px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            {submittingArt ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" /> Submit Artwork
                                </>
                            )}
                        </button>
                    </form>

                     {/* Display Submitted Artworks */}
                     <div className="mt-8 border-t pt-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">My Art Submissions</h4>
                        {loadingArtSubmissions ? (
                            <div className="text-center py-4 text-gray-500 text-sm">Loading submissions...</div>
                        ) : artSubmissions.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm">You haven't submitted any artwork yet.</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {artSubmissions.map((art) => (
                                    <div key={art.id} className="relative group bg-gray-100 rounded-lg overflow-hidden border">
                                        <img src={art.image_url} alt={art.title} className="w-full h-24 object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <p className="text-white text-xs font-semibold truncate">{art.title}</p>
                                             <span className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium inline-block w-fit ${
                                                  art.status === 'approved' ? 'bg-green-500 text-white' :
                                                  art.status === 'rejected' ? 'bg-red-500 text-white' :
                                                  'bg-yellow-500 text-black'
                                             }`}>
                                                {art.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;