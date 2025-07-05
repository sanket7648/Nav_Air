import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Users, 
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Car,
  Plane
} from 'lucide-react';

export const SlotBookingPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedService, setSelectedService] = useState('arrival');

  const services = [
    {
      id: 'arrival',
      title: 'Arrival Time Slot',
      description: 'Reserve your arrival time at the airport',
      icon: Plane,
      color: 'bg-blue-600'
    },
    {
      id: 'parking',
      title: 'Parking Reservation',
      description: 'Secure a parking spot in advance',
      icon: Car,
      color: 'bg-green-600'
    },
    {
      id: 'checkin',
      title: 'Check-in Slot',
      description: 'Skip the line with reserved check-in',
      icon: CheckCircle,
      color: 'bg-purple-600'
    },
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
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
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

  const handleBooking = () => {
    if (selectedSlot) {
      setBookingStep(3);
    }
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="pt-36 px-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Slot Booking</h2>
        <p className="text-gray-600">Reserve your preferred time slots</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className={`ml-2 text-sm font-medium ${
                  isCurrent ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {item.title}
                </div>
                {index < 2 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Service Selection */}
      {bookingStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Service</h3>
          {services.map((service) => {
            const Icon = service.icon;
            const isSelected = selectedService === service.id;
            
            return (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${service.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">{service.title}</h4>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
            );
          })}
          
          <button
            onClick={() => setBookingStep(2)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-6"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Date & Time Selection */}
      {bookingStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
            
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h4 className="font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h4>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(selectedDate).map((date) => (
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
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
            <p className="text-sm text-gray-600 mb-4">
              {formatDate(selectedDate)} • {selectedServiceData?.title}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && setSelectedSlot(slot.time)}
                  disabled={!slot.available}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSlot === slot.time
                      ? 'border-blue-500 bg-blue-50'
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
                    <span className={`text-xs px-2 py-1 rounded-full ${getCapacityColor(slot.capacity)}`}>
                      {slot.capacity}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setBookingStep(1)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleBooking}
              disabled={!selectedSlot}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Book Slot
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {bookingStep === 3 && (
        <div className="space-y-6">
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Booking Confirmed!</h3>
              <p className="text-green-700">Your slot has been successfully reserved</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Service</span>
                <span className="font-medium">{selectedServiceData?.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Time</span>
                <span className="font-medium">{selectedSlot}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Booking ID</span>
                <span className="font-medium">#BK{Date.now().toString().slice(-6)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setBookingStep(1)}
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
  );
};