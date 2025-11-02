import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Globe, Check, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/external-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Comprehensive country data with provinces/states/cities
const locationData: Record<string, string[]> = {
  'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
  'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland', 'London', 'Birmingham', 'Manchester', 'Glasgow', 'Edinburgh', 'Liverpool', 'Bristol', 'Cardiff', 'Belfast'],
  'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Northern Territory', 'Australian Capital Territory'],
  'Germany': ['Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'],
  'France': ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Occitanie', 'Hauts-de-France', 'Brittany', 'Normandy', 'Grand Est', 'Centre-Val de Loire', 'Burgundy', 'Pays de la Loire'],
  'India': ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'],
  'China': ['Beijing', 'Shanghai', 'Guangdong', 'Zhejiang', 'Jiangsu', 'Shandong', 'Sichuan', 'Henan', 'Hubei', 'Fujian', 'Hunan', 'Anhui', 'Liaoning', 'Shaanxi', 'Heilongjiang', 'Shanxi', 'Jiangxi', 'Guangxi', 'Yunnan', 'Chongqing', 'Tianjin'],
  'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido', 'Fukuoka', 'Nagoya', 'Sapporo', 'Yokohama', 'Kobe', 'Hiroshima', 'Sendai'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Bahia', 'Minas Gerais', 'Paraná', 'Rio Grande do Sul', 'Pernambuco', 'Ceará', 'Pará', 'Goiás', 'Santa Catarina', 'Maranhão'],
  'Mexico': ['Mexico City', 'Jalisco', 'Nuevo León', 'Puebla', 'Guanajuato', 'Veracruz', 'Chiapas', 'Michoacán', 'Oaxaca', 'Chihuahua', 'Guerrero', 'Tamaulipas'],
  'South Africa': ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'],
  'Nigeria': ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Kaduna', 'Maiduguri', 'Zaria', 'Aba', 'Jos', 'Ilorin'],
  'Spain': ['Madrid', 'Catalonia', 'Andalusia', 'Valencia', 'Galicia', 'Castile and León', 'Basque Country', 'Castilla-La Mancha', 'Murcia', 'Aragon', 'Extremadura', 'Balearic Islands'],
  'Italy': ['Lazio', 'Lombardy', 'Campania', 'Sicily', 'Veneto', 'Piedmont', 'Emilia-Romagna', 'Apulia', 'Tuscany', 'Calabria', 'Sardinia', 'Liguria'],
  'Netherlands': ['North Holland', 'South Holland', 'Utrecht', 'North Brabant', 'Gelderland', 'Limburg', 'Overijssel', 'Groningen', 'Friesland', 'Flevoland', 'Drenthe', 'Zeeland'],
  'Argentina': ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Entre Ríos', 'Salta', 'Chaco', 'Corrientes', 'Misiones', 'Santiago del Estero'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Sejong', 'Gyeonggi', 'Gangwon', 'North Chungcheong', 'South Chungcheong'],
  'Indonesia': ['Jakarta', 'West Java', 'East Java', 'Central Java', 'North Sumatra', 'South Sulawesi', 'Banten', 'Lampung', 'East Kalimantan', 'South Sumatra', 'Bali'],
  'Philippines': ['Metro Manila', 'Cebu', 'Davao', 'Calabarzon', 'Central Luzon', 'Western Visayas', 'Central Visayas', 'Zamboanga Peninsula', 'Northern Mindanao', 'Bicol Region'],
  'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep', 'Konya', 'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir'],
  'Poland': ['Masovian', 'Silesian', 'Greater Poland', 'Lesser Poland', 'Lower Silesian', 'Łódź', 'West Pomeranian', 'Pomeranian', 'Lublin', 'Kuyavian-Pomeranian'],
  'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Shubra El-Kheima', 'Port Said', 'Suez', 'Luxor', 'Aswan', 'Mansoura', 'Tanta', 'Ismailia'],
  'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Nakhon Ratchasima', 'Khon Kaen', 'Udon Thani', 'Hat Yai', 'Nakhon Si Thammarat', 'Surat Thani'],
  'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hai Phong', 'Can Tho', 'Bien Hoa', 'Nha Trang', 'Hue', 'Buon Ma Thuot', 'Vung Tau'],
  'Malaysia': ['Kuala Lumpur', 'Selangor', 'Johor', 'Penang', 'Perak', 'Pahang', 'Sarawak', 'Sabah', 'Kedah', 'Kelantan', 'Terengganu', 'Malacca'],
  'Singapore': ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region'],
  'New Zealand': ['Auckland', 'Wellington', 'Canterbury', 'Waikato', 'Bay of Plenty', 'Manawatū-Whanganui', 'Otago', 'Northland', 'Taranaki', 'Southland'],
  'Chile': ['Santiago', 'Valparaíso', 'Biobío', 'Araucanía', 'Maule', 'Los Lagos', 'Antofagasta', 'Coquimbo', 'O\'Higgins', 'Ñuble'],
  'Colombia': ['Bogotá', 'Antioquia', 'Valle del Cauca', 'Atlántico', 'Bolívar', 'Santander', 'Cundinamarca', 'Norte de Santander', 'Tolima', 'Cauca'],
  'Peru': ['Lima', 'Arequipa', 'La Libertad', 'Piura', 'Lambayeque', 'Cusco', 'Junín', 'Puno', 'Ica', 'Cajamarca'],
  'Venezuela': ['Capital District', 'Miranda', 'Zulia', 'Carabobo', 'Lara', 'Aragua', 'Bolívar', 'Anzoátegui', 'Táchira', 'Mérida'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Ruiru', 'Kikuyu', 'Kangundo-Tala', 'Malindi', 'Naivasha'],
  'Ghana': ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Northern', 'Volta', 'Brong-Ahafo', 'Upper East', 'Upper West'],
  'Pakistan': ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad', 'Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan'],
  'Bangladesh': ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'],
  'Saudi Arabia': ['Riyadh', 'Makkah', 'Eastern Province', 'Medina', 'Asir', 'Jazan', 'Qassim', 'Tabuk', 'Hail', 'Northern Borders'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
  'Israel': ['Jerusalem', 'Tel Aviv', 'Haifa', 'Rishon LeZion', 'Petah Tikva', 'Ashdod', 'Netanya', 'Beersheba', 'Holon', 'Bnei Brak'],
  'Sweden': ['Stockholm', 'Västra Götaland', 'Skåne', 'Uppsala', 'Östergötland', 'Jönköping', 'Halland', 'Örebro', 'Gävleborg', 'Dalarna'],
  'Norway': ['Oslo', 'Viken', 'Vestland', 'Trøndelag', 'Rogaland', 'Innlandet', 'Nordland', 'Agder', 'Møre og Romsdal', 'Vestfold og Telemark'],
  'Denmark': ['Capital Region', 'Central Denmark', 'North Denmark', 'Zealand', 'Southern Denmark'],
  'Finland': ['Uusimaa', 'Pirkanmaa', 'Southwest Finland', 'North Ostrobothnia', 'Central Finland', 'Satakunta', 'Päijänne Tavastia', 'Kanta-Häme'],
  'Belgium': ['Flanders', 'Wallonia', 'Brussels', 'Antwerp', 'East Flanders', 'Flemish Brabant', 'Limburg', 'West Flanders', 'Hainaut', 'Liège'],
  'Austria': ['Vienna', 'Lower Austria', 'Upper Austria', 'Styria', 'Tyrol', 'Carinthia', 'Salzburg', 'Vorarlberg', 'Burgenland'],
  'Switzerland': ['Zürich', 'Bern', 'Vaud', 'Aargau', 'Geneva', 'Lucerne', 'Ticino', 'Valais', 'St. Gallen', 'Basel-Stadt'],
  'Portugal': ['Lisbon', 'Porto', 'Setúbal', 'Braga', 'Aveiro', 'Faro', 'Coimbra', 'Leiria', 'Viseu', 'Santarém'],
  'Greece': ['Attica', 'Central Macedonia', 'Thessaloniki', 'West Greece', 'Crete', 'Epirus', 'Central Greece', 'Peloponnese', 'Thessaly', 'East Macedonia and Thrace'],
  'Czech Republic': ['Prague', 'Central Bohemia', 'South Moravia', 'Moravian-Silesian', 'Olomouc', 'Zlín', 'South Bohemia', 'Hradec Králové', 'Pardubice', 'Plzeň'],
  'Romania': ['Bucharest', 'Ilfov', 'Cluj', 'Timiș', 'Iași', 'Constanța', 'Brașov', 'Dolj', 'Prahova', 'Galați'],
  'Hungary': ['Budapest', 'Pest', 'Bács-Kiskun', 'Hajdú-Bihar', 'Borsod-Abaúj-Zemplén', 'Szabolcs-Szatmár-Bereg', 'Csongrád-Csanád', 'Győr-Moson-Sopron', 'Jász-Nagykun-Szolnok'],
  'Other': ['City/Region 1', 'City/Region 2', 'City/Region 3', 'Other']
};

const countries = Object.keys(locationData).sort();

export default function OnboardingNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const availableRegions = selectedCountry ? locationData[selectedCountry] : [];

  const handleComplete = async () => {
    if (!user || !selectedCountry || !selectedRegion) {
      toast.error('Please select both country and region');
      return;
    }

    setIsLoading(true);

    try {
      // Store location in user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          country: selectedCountry,
          region: selectedRegion
        }
      });

      if (updateError) throw updateError;

      // Check if user_mode_settings already exists
      const { data: existingSettings, error: fetchSettingsError } = await supabase
        .from('user_mode_settings' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchSettingsError && fetchSettingsError.code !== 'PGRST116') {
        throw fetchSettingsError;
      }

      if (existingSettings) {
        // Update existing record
        const { error: updateSettingsError } = await supabase
          .from('user_mode_settings' as any)
          .update({
            onboarding_completed: true,
            plan_type: 'trial',
          })
          .eq('user_id', user.id);
        
        if (updateSettingsError) throw updateSettingsError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('user_mode_settings' as any)
          .insert({
            user_id: user.id,
            active_mode: 'work',
            student_mode_enabled: false,
            work_mode_enabled: true,
            onboarding_completed: true,
            plan_type: 'trial',
            trial_start_date: new Date().toISOString(),
            trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        
        if (insertError) throw insertError;
      }

      // Save onboarding profile
      const { data: existingOnboarding, error: fetchOnboardingError } = await supabase
        .from('onboarding_profiles' as any)
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchOnboardingError && fetchOnboardingError.code !== 'PGRST116') {
        throw fetchOnboardingError;
      }

      if (!existingOnboarding) {
        const { error: profileError } = await supabase
          .from('onboarding_profiles' as any)
          .insert({
            user_id: user.id,
            selected_mode: 'work',
            selected_plan: 'professional',
          });
        if (profileError) throw profileError;
      }

      toast.success('Welcome to D-TRACK! 🎉 Your 30-day trial has started.');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border-2 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold">Welcome to D-TRACK!</CardTitle>
            <CardDescription className="text-base mt-2">
              Let's get you started with just one quick question
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Country Selection */}
            <div className="space-y-3">
              <Label htmlFor="country" className="flex items-center gap-2 text-base font-medium">
                <Globe className="h-5 w-5 text-primary" />
                Where are you located?
              </Label>
              <Select value={selectedCountry} onValueChange={(value) => {
                setSelectedCountry(value);
                setSelectedRegion(''); // Reset region when country changes
              }}>
                <SelectTrigger id="country" className="h-12 text-base">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {countries.map((country) => (
                    <SelectItem key={country} value={country} className="text-base">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region Selection */}
            {selectedCountry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <Label htmlFor="region" className="flex items-center gap-2 text-base font-medium">
                  <MapPin className="h-5 w-5 text-primary" />
                  Select your region/city
                </Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger id="region" className="h-12 text-base">
                    <SelectValue placeholder="Select your region or city" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {availableRegions.map((region) => (
                      <SelectItem key={region} value={region} className="text-base">
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {/* Complete Button */}
            <Button 
              onClick={handleComplete} 
              disabled={isLoading || !selectedCountry || !selectedRegion}
              size="lg"
              className="w-full h-12 text-base font-semibold"
            >
              {isLoading ? (
                'Setting up your account...'
              ) : (
                <>
                  Complete Setup
                  <Check className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            {/* Info Text */}
            <p className="text-center text-sm text-muted-foreground">
              🎉 Start your 30-day free trial • No credit card required
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
