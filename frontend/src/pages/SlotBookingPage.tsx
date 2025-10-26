import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Users, 
  Car,
  Plane,
  Lock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  QrCode,
  AlertTriangle
} from 'lucide-react';
// ✅ FIX 1: Correctly import the QRCode component using a named import.
// The library exports its component as a named export, not a default one.
// This resolves the "Element type is invalid" error.
import { QRCodeSVG } from 'qrcode.react'; 
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';

// Interface for the booking result (mirrors backend response)
interface BookingResult {
  bookingId: string;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  qrCodeData: string;
}

export const SlotBookingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedService, setSelectedService] = useState('arrival');
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const services = [
    { id: 'arrival', title: 'Arrival Time Slot', description: 'Reserve your arrival time at the airport', icon: Plane, color: 'bg-blue-600' },
    { id: 'parking', title: 'Parking Reservation', description: 'Secure a parking spot in advance', icon: Car, color: 'bg-green-600' },
    { id: 'checkin', title: 'Check-in Slot', description: 'Skip the line with reserved check-in', icon: CheckCircle, color: 'bg-purple-600' },
  ];

  const timeSlots = [
    { time: '06:00', available: true, capacity: 'Low' },
    { time: '07:00', available: true, capacity: 'Medium' },
    { time: '08:00', available: false, capacity: 'Full' },
    { time: '09:00', available: true, capacity: 'High' },
    { time: '10:00', available: true, capacity: 'Low' },
    { time: '11:00', available: true, capacity: 'Medium' },
    { time: '12:00', available: false, capacity: 'Full' },
    { time: '13:00', available: true, capacity: 'Low' },
    { time: '14:00', available: true, capacity: 'Medium' },
    { time: '15:00', available: true, capacity: 'High' },
    { time: '16:00', available: false, capacity: 'Full' },
    { time: '17:00', available: true, capacity: 'Low' },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getCapacityColor = (capacity: string) => {
    switch (capacity) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Full': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  const handleBooking = async () => {
    if (!selectedSlot) return;
    if (!isAuthenticated) {
      setBookingError("Please sign in to confirm your booking.");
      return;
    }

    setIsBookingLoading(true);
    setBookingError(null);
    
    const serviceTitle = selectedServiceData?.title;
    if (!serviceTitle) {
      setBookingError("Please select a valid service before continuing.");
      setIsBookingLoading(false);
      return;
    }
    
    const bookingDateString = selectedDate.toISOString().split('T')[0];

    try {
      const result = await bookingAPI.create({
        serviceType: serviceTitle,
        bookingDate: bookingDateString,
        bookingTime: selectedSlot,
      });

      setBookingResult({
        bookingId: result.bookingId,
        serviceType: result.serviceType,
        bookingDate: bookingDateString, 
        bookingTime: result.bookingTime,
        qrCodeData: result.qrCodeData,
      });
      setBookingStep(3);

    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsBookingLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-100 -z-10" />

      <div className="flex flex-col items-center py-6 sm:py-12 px-2 sm:px-0 pt-[100px] sm:pt-[100px] md:pb-[200px]">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-3 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5">Slot Booking</h2>
            <p className="text-gray-600 text-sm">Reserve your preferred time slots for fast-track service</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center">
              {[
                { step: 1, title: 'Service', icon: Users },
                { step: 2, title: 'Date & Time', icon: Calendar },
                { step: 3, title: 'Confirmation', icon: CheckCircle },
              ].map((item, index) => {
                const Icon = item.icon;
                const isActive = bookingStep >= item.step;
                const isCurrent = bookingStep === item.step;
                return (
                  <div key={item.step} className="flex items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className={`ml-1.5 text-xs font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-600'}`}>
                      {item.title}
                    </div>
                    {index < 2 && (
                      <div className={`h-0.5 w-6 mx-2 ${isActive && bookingStep > item.step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 1: Service Selection */}
          {bookingStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Select Service Type</h3>
              {services.map((service) => {
                const Icon = service.icon;
                const isSelected = selectedService === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`w-full p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${service.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-gray-900 text-sm">{service.title}</h4>
                        <p className="text-xs text-gray-600">{service.description}</p>
                      </div>
                      {isSelected && <CheckCircle className="w-4 h-4 text-blue-600" />}
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => setBookingStep(2)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors mt-4 text-base shadow-md"
              >
                Continue to Date & Time <ArrowRight className="w-5 h-5 inline ml-2" />
              </button>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {bookingStep === 2 && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
                
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h4 className="font-semibold text-gray-900">{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
                  <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {/* ✅ FIX 2: Used a unique key by combining the day and its index. */}
                  {/* This resolves the "Encountered two children with the same key" warning. */}
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={`${day}-${index}`} className="text-center text-sm font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(selectedDate).map((date, index) => (
                    date ? (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                          isSameDay(date, selectedDate)
                            ? 'bg-blue-600 text-white'
                            : isToday(date)
                            ? 'bg-blue-100 text-blue-600'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    ) : (
                      <div key={`empty-${index}`}></div>
                    )
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
                <p className="text-sm text-gray-600 mb-4">{formatDate(selectedDate)} • {selectedServiceData?.title}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedSlot(slot.time)}
                      disabled={!slot.available || isBookingLoading}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedSlot === slot.time
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : slot.available
                          ? 'border-gray-200 bg-white hover:border-gray-300'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">{slot.time}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getCapacityColor(slot.capacity)}`}>{slot.capacity}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {!isAuthenticated && (
                <a href="/login" className="flex items-center p-4 bg-blue-100 border border-blue-200 rounded-xl text-blue-800 space-x-3 hover:bg-blue-200 transition-colors">
                  <Lock className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Please sign in to confirm your booking.</span>
                </a>
              )}
              {bookingError && (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 space-x-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{bookingError}</span>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setBookingStep(1)}
                  disabled={isBookingLoading}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleBooking}
                  disabled={!selectedSlot || isBookingLoading || !isAuthenticated}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
                >
                  {isBookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    isAuthenticated ? 'Book Slot' : 'Sign In to Book'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {bookingStep === 3 && bookingResult && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-900 mb-2">Booking Confirmed!</h3>
                  <p className="text-green-700">Your slot for {bookingResult.serviceType} has been successfully reserved</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Service</span>
                    <span className="font-medium">{bookingResult.serviceType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{formatDate(new Date(bookingResult.bookingDate))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium">{bookingResult.bookingTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Booking ID</span>
                    <span className="font-medium text-blue-600">#{bookingResult.bookingId}</span>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <QrCode className="w-5 h-5 mr-2 text-blue-600" />
                    Your Access QR Code
                  </h4>
                  
                  <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="p-2 bg-white rounded-lg border-4 border-white shadow-lg">
                      {/* ✅ FIX 1 (cont.): Use the correctly imported QRCodeSVG component */}
                      <QRCodeSVG value={bookingResult.qrCodeData} size={128} level="H" />
                    </div>
                    <p className="text-xs text-blue-600 font-medium">Present this code at the service point.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setBookingStep(1);
                    setSelectedSlot(null);
                    setBookingResult(null);
                  }}
                  className="bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  New Booking
                </button>
                <button className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Add to Calendar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SlotBookingPage;