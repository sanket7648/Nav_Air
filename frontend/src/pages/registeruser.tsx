import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavAirLogo from '../assets/NavAir.jpg';

export const RegisterUser: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ field: string; message: string }[]>([]);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    contact_number: '',
    country: '',
    city: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/otp-verify', { state: { email: form.email } });
      } else if (data.errors) {
        setFieldErrors(data.errors);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const countries = [ "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181f2a] to-[#232946] py-12 px-4 sm:px-6 lg:px-8">
      {/* Changed max-w-md to max-w-lg to make the card wider */}
      <div className="w-full max-w-lg p-8 rounded-2xl shadow-2xl bg-[#181f2a] relative transition-all duration-500">
        {/* Decorative Orbs */}
        <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-blue-400/30 to-purple-400/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-br from-fuchsia-400/30 to-pink-400/10 rounded-full blur-xl pointer-events-none"></div>
        {/* Logo & Welcome */}
        <div className="flex flex-col items-center mb-6 relative z-10">
          <img src={NavAirLogo} alt="NavAir" className="w-16 h-16 object-cover mb-2" />
          <h2 className="text-3xl font-bold text-white mb-1">Create Account</h2>
          <p className="text-gray-400">Register for your NavAir experience</p>
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-900/20 border border-red-800 text-red-300 text-sm relative z-10">
            <span>{error}</span>
          </div>
        )}
        {fieldErrors.length > 0 && (
          <div className="p-3 mb-4 rounded-lg bg-red-900/20 border border-red-800 text-red-300 text-sm relative z-10">
            <ul className="list-disc list-inside space-y-1">
              {fieldErrors.map((err, idx) => (
                <li key={idx}>
                  <span className="font-semibold capitalize">{err.field.replace('_', ' ')}:</span> {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input id="username" name="username" type="text" required disabled={isLoading} value={form.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-700 bg-[#232946] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Choose a username"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input id="email" name="email" type="email" required disabled={isLoading} value={form.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-700 bg-[#232946] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="you@email.com"/>
            </div>
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} required disabled={isLoading} value={form.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-700 bg-[#232946] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-16" placeholder="Create a strong password"/>
            <button type="button" tabIndex={-1} className="absolute right-4 top-9 transform -translate-y-1/2 text-neutral-400 hover:text-blue-500 text-sm font-semibold" onClick={() => setShowPassword((v) => !v)} style={{height: '32px'}}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div>
            <label htmlFor="contact_number" className="block text-sm font-medium text-gray-300 mb-1">Contact Number</label>
            <input id="contact_number" name="contact_number" type="tel" required disabled={isLoading} value={form.contact_number} onChange={handleChange} className="w-full px-4 py-2 border border-gray-700 bg-[#232946] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Your contact number"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">City</label>
              <input id="city" name="city" type="text" required disabled={isLoading} value={form.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-700 bg-[#232946] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter your city"/>
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">Country</label>
              <select id="country" name="country" required disabled={isLoading} value={form.country} onChange={handleChange} className="w-full px-4 py-2 border border-gray-700 bg-[#232946] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="" disabled>Select country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50">
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="text-center text-gray-400 text-sm mt-6">
          Already have an account? <span className="text-blue-400 hover:underline cursor-pointer" onClick={() => navigate('/login')}>Sign in here</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;