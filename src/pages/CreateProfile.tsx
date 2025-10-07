import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Upload, Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { initializeAnalytics } from '@/lib/analytics';
import { 
  validateUsernameFormat, 
  checkUsernameAvailability, 
  normalizeUsername,
  suggestUsername 
} from '@/lib/usernameValidator';

const SECTORS = [
  'Technology', 'Entertainment', 'Food & Dining', 'Fashion', 'Education',
  'Sports', 'Healthcare', 'Finance', 'Travel', 'Real Estate', 'Other'
];

const SOCIAL_PLATFORMS = [
  'Facebook', 'YouTube', 'Instagram', 'WhatsApp', 'LinkedIn', 
  'Telegram', 'Snapchat', 'X', 'PlayStore', 'Website'
];

interface SocialLink {
  platform: string;
  url: string;
}

export default function CreateProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [sector, setSector] = useState('');
  const [customSector, setCustomSector] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [caption, setCaption] = useState('Follow and Rate Us on RateHere!');
  // Contact Information (private - shown only to owner and admins)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');

  const isEditMode = !!id;

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'profiles', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Check if user owns this profile
          if (data.createdBy !== user?.uid) {
            toast.error('You do not have permission to edit this profile');
            navigate('/dashboard');
            return;
          }
          
          setName(data.name || '');
          setUsername(data.username || '');
          if (data.username) {
            setUsernameAvailable(true); // Existing username is valid
          }
          setSector(data.sector || '');
          setDescription(data.description || '');
          setLogoPreview(data.logoUrl || '');
          setBannerPreview(data.bannerUrl || '');
          setSocialLinks(data.socialLinks || []);
          setCaption(data.caption || 'Follow and Rate Us on RateHere!');
          // Load contact information
          setPhoneNumber(data.phoneNumber || '');
          setEmail(data.email || '');
          setWhatsappNumber(data.whatsappNumber || '');
          setAddress(data.address || '');
        } else {
          toast.error('Profile not found');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
        navigate('/dashboard');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, [id, user, navigate]);

  // Debounced username validation
  useEffect(() => {
    if (!username) {
      setUsernameError('');
      setUsernameAvailable(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      // Check format first
      const formatCheck = validateUsernameFormat(username);
      if (!formatCheck.valid) {
        setUsernameError(formatCheck.error || '');
        setUsernameAvailable(false);
        return;
      }

      // Check availability
      setUsernameChecking(true);
      setUsernameError('');
      
      try {
        const availabilityCheck = await checkUsernameAvailability(username, user?.uid);
        if (availabilityCheck.available) {
          setUsernameAvailable(true);
          setUsernameError('');
        } else {
          setUsernameAvailable(false);
          setUsernameError(availabilityCheck.error || 'Username is not available');
        }
      } catch (error) {
        setUsernameError('Failed to check username availability');
        setUsernameAvailable(false);
      } finally {
        setUsernameChecking(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [username, user]);

  // Auto-suggest username from name
  const handleNameChange = (value: string) => {
    setName(value);
    
    // Only suggest username if creating new profile and username is empty
    if (!isEditMode && !username && value.length >= 3) {
      const suggested = suggestUsername(value);
      setUsername(suggested);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be signed in to create a profile');
      return;
    }

    if (!name || !sector || (!logoFile && !logoPreview)) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate username
    if (!username) {
      toast.error('Username is required');
      return;
    }

    if (!usernameAvailable || usernameError) {
      toast.error(usernameError || 'Please choose a valid username');
      return;
    }

    setLoading(true);

    try {
      let logoUrl = logoPreview;
      let bannerUrl = bannerPreview;

      // Upload logo to Cloudinary only if a new file was selected
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        formData.append('upload_preset', 'ratehere');
        
        const cloudinaryResponse = await fetch(
          'https://api.cloudinary.com/v1_1/djlrarljg/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        );
        
        if (!cloudinaryResponse.ok) {
          throw new Error('Failed to upload logo image');
        }
        
        const cloudinaryData = await cloudinaryResponse.json();
        logoUrl = cloudinaryData.secure_url;
      }

      // Upload banner to Cloudinary only if a new file was selected
      if (bannerFile) {
        const formData = new FormData();
        formData.append('file', bannerFile);
        formData.append('upload_preset', 'ratehere');
        
        const cloudinaryResponse = await fetch(
          'https://api.cloudinary.com/v1_1/djlrarljg/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        );
        
        if (!cloudinaryResponse.ok) {
          throw new Error('Failed to upload banner image');
        }
        
        const cloudinaryData = await cloudinaryResponse.json();
        bannerUrl = cloudinaryData.secure_url;
      }

      // Create or update profile document in Firestore
      const finalSector = sector === 'Other' ? customSector : sector;
      const validSocialLinks = socialLinks.filter(link => link.platform && link.url);

      const profileData = {
        name,
        username: username.trim(),
        usernameLower: normalizeUsername(username), // For case-insensitive queries
        sector: finalSector,
        description,
        logoUrl,
        bannerUrl,
        socialLinks: validSocialLinks,
        caption,
        // Private contact information (visible only to owner and admins)
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        whatsappNumber: whatsappNumber.trim(),
        address: address.trim(),
      };

      if (isEditMode && id) {
        await updateDoc(doc(db, 'profiles', id), {
          ...profileData,
          updatedAt: new Date(),
        });
        toast.success('Profile updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'profiles'), {
          ...profileData,
          createdBy: user.uid,
          createdByEmail: user.email || 'Unknown',
          createdByName: user.displayName || null,
          createdAt: new Date(),
          rating: 0,
          ratingCount: 0,
          totalRatingValue: 0,
        });
        
        // Initialize analytics fields for the new profile
        await initializeAnalytics(docRef.id);
        
        toast.success('Profile created successfully!');
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-7xl px-4 pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto max-w-4xl px-4 pt-24 pb-12">
        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              {isEditMode ? 'Edit Your Profile' : 'Create Your Profile'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isEditMode ? 'Update your information' : 'Share your story and let the community rate you'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Tell us about yourself or your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Profile Logo/Image *</Label>
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted">
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('logo')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner">Banner Image (Optional)</Label>
                  <div className="space-y-4">
                    {bannerPreview && (
                      <div className="w-full h-48 rounded-xl overflow-hidden bg-muted">
                        <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <Input
                        id="banner"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('banner')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Banner
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended size: 1200x400px for best display
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter your name or business name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a unique username"
                      required
                      className={`pr-10 ${
                        username && !usernameChecking && usernameAvailable
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : username && !usernameChecking && usernameError
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : ''
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameChecking ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : username && usernameAvailable ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : username && usernameError ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                  {username && (
                    <p className={`text-sm ${usernameError ? 'text-red-500' : usernameAvailable ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {usernameError || (usernameAvailable ? '✓ Username is available!' : 'Checking availability...')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Your profile will be available at: ratehere.now/profile/{username || 'username'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">Business Sector *</Label>
                  <Select value={sector} onValueChange={setSector} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {sector === 'Other' && (
                  <div className="space-y-2">
                    <Label htmlFor="customSector">Custom Sector</Label>
                    <Input
                      id="customSector"
                      value={customSector}
                      onChange={(e) => setCustomSector(e.target.value)}
                      placeholder="Enter your custom sector"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell people about yourself..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information (Private) */}
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Contact Information</span>
                  <Badge variant="secondary" className="text-xs">Private</Badge>
                </CardTitle>
                <CardDescription>
                  This information is visible only to you and administrators. It will not be shown publicly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St, City, State, ZIP"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Add your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="caption">Social Links Caption</Label>
                  <Input
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Follow and Rate Us on RateHere!"
                  />
                </div>

                {socialLinks.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      value={link.platform}
                      onValueChange={(value) => updateSocialLink(index, 'platform', value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSocialLink(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addSocialLink}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Social Link
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Profile' : 'Create Profile')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
