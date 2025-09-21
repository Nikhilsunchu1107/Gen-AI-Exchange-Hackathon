import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Separator } from "./components/ui/separator";
import { Toaster } from "./components/ui/toaster";
import { toast } from "./hooks/use-toast";
import { Sparkles, Globe, Heart, Star, Upload, Mic, Languages, ShoppingBag, User, LogOut, Plus } from "lucide-react";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Mock user for MVP
      setUser({
        id: "user_123",
        email: "artisan@craftvista.com",
        name: "Sample Artisan",
        picture: "https://images.unsplash.com/photo-1611574557783-9a50bb34e9f5",
        role: "artisan"
      });
    }
    setLoading(false);
  }, []);

  const login = async () => {
    // Mock login for MVP
    const mockUser = {
      id: "user_123",
      email: "artisan@craftvista.com",
      name: "Sample Artisan",
      picture: "https://images.unsplash.com/photo-1611574557783-9a50bb34e9f5",
      role: "artisan"
    };
    
    setUser(mockUser);
    localStorage.setItem('auth_token', 'mock_token_123');
    toast({
      title: "Welcome to CraftVista! 🎉",
      description: "Start showcasing your beautiful handmade crafts"
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    toast({
      title: "Logged out successfully",
      description: "Come back soon!"
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Components
const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-rose-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-amber-900">CraftVista</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/marketplace" className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors">
              Marketplace
            </Link>
            <Link to="/artisans" className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors">
              Meet Artisans
            </Link>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <Languages className="h-4 w-4 text-gray-500" />
            </div>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/upload')}
                  className="hidden sm:flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Product</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.picture} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="60" height="60" viewBox="0 0 60 60" className="w-full h-full">
          <pattern id="pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="2" fill="#d97706"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                AI-Powered Marketplace ✨
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Empowering Indian
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500"> Artisans</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-xl">
                Showcase your handmade crafts with AI-powered storytelling, reach global customers, 
                and preserve traditional heritage with modern technology.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 text-white px-8 py-3"
                onClick={() => navigate('/upload')}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Selling
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-amber-200 hover:bg-amber-50 px-8 py-3"
                onClick={() => navigate('/marketplace')}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Explore Marketplace
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">1000+</div>
                <div className="text-sm text-gray-600">Artisans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">50+</div>
                <div className="text-sm text-gray-600">Craft Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">9+</div>
                <div className="text-sm text-gray-600">Languages</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Images */}
          <div className="grid grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-6">
              <div className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src="https://images.unsplash.com/photo-1640292343595-889db1c8262e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBhcnRpc2Fuc3xlbnwwfHx8fDE3NTg0NTE3OTF8MA&ixlib=rb-4.1.0&q=85"
                  alt="Artisan weaving"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src="https://images.unsplash.com/photo-1506806732259-39c2d0268443?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMGNyYWZ0c3xlbnwwfHx8fDE3NTg0NTE3OTd8MA&ixlib=rb-4.1.0&q=85"
                  alt="Handmade jewelry"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="space-y-6 mt-8">
              <div className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src="https://images.unsplash.com/photo-1611574557783-9a50bb34e9f5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxJbmRpYW4lMjBhcnRpc2Fuc3xlbnwwfHx8fDE3NTg0NTE3OTF8MA&ixlib=rb-4.1.0&q=85"
                  alt="Pottery artisan"
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src="https://images.unsplash.com/photo-1662717400948-990d71f9e3a8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwzfHxJbmRpYW4lMjBhcnRpc2Fuc3xlbnwwfHx8fDE3NTg0NTE3OTF8MA&ixlib=rb-4.1.0&q=85"
                  alt="Craft work"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Cataloging",
      description: "Automatically generate compelling product titles, descriptions, and pricing suggestions",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Voice Storytelling",
      description: "Convert your voice recordings into engaging product stories that connect with customers",
      color: "from-purple-400 to-purple-600"
    },
    {
      icon: <Languages className="h-6 w-6" />,
      title: "Multilingual Support",
      description: "Reach customers worldwide with automatic translation to 9+ Indian languages",
      color: "from-green-400 to-green-600"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Marketplace",
      description: "Connect with international buyers who appreciate authentic handmade crafts",
      color: "from-orange-400 to-orange-600"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Cultural Heritage",
      description: "Preserve and share the rich cultural stories behind traditional Indian crafts",
      color: "from-rose-400 to-rose-600"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Quality Assurance",
      description: "AI-powered authenticity verification ensures only genuine handmade crafts",
      color: "from-amber-400 to-amber-600"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">AI Innovation</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Modern technology meets traditional craftsmanship to help artisans reach global markets
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <CardHeader className="space-y-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    await login();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-2 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to CraftVista</CardTitle>
          <CardDescription>
            Join thousands of artisans showcasing their beautiful handmade crafts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 text-white py-3"
            size="lg"
          >
            <User className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
          <div className="text-center text-sm text-gray-500">
            By signing in, you agree to showcase authentic handmade crafts
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProductUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    materials: [],
    price: '',
    voiceNote: ''
  });
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [categories] = useState([
    { id: "pottery", name: "Pottery & Ceramics" },
    { id: "textiles", name: "Textiles & Fabrics" },
    { id: "jewelry", name: "Jewelry & Accessories" },
    { id: "woodwork", name: "Woodwork & Furniture" },
    { id: "metalwork", name: "Metalwork & Sculptures" },
    { id: "paintings", name: "Paintings & Art" }
  ]);

  if (!user) return <Navigate to="/login" />;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateAIContent = async () => {
    setLoading(true);
    try {
      // Mock AI response for MVP
      setTimeout(() => {
        const mockSuggestions = {
          title: `Handcrafted ${formData.category} - Traditional Indian Artistry`,
          description: `Beautifully crafted ${formData.category} made using traditional techniques passed down through generations. Each piece tells a story of cultural heritage and skilled artisanship.`,
          price_suggestion: 1500,
          cultural_context: `This ${formData.category} represents the timeless tradition of Indian craftsmanship, where each piece is created with meticulous attention to detail and deep respect for ancestral techniques.`
        };
        setAiSuggestions(mockSuggestions);
        setLoading(false);
        setStep(2);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI content",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Mock submission for MVP
      setTimeout(() => {
        toast.success("Product uploaded successfully! 🎉");
        navigate('/marketplace');
      }, 1500);
    } catch (error) {
      toast.error("Failed to upload product");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Craft</h1>
          <p className="text-gray-600">Let AI help you create the perfect product listing</p>
        </div>

        {step === 1 && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Tell us about your craft</CardTitle>
              <CardDescription>
                Provide basic information and let our AI generate compelling content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category *</label>
                <Select onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select craft category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Brief Description *</label>
                <Textarea
                  placeholder="Describe your craft in a few sentences..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Materials Used</label>
                <Input
                  placeholder="e.g., Clay, Cotton, Silver (comma-separated)"
                  value={formData.materials.join(', ')}
                  onChange={(e) => handleInputChange('materials', e.target.value.split(',').map(s => s.trim()))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Voice Note (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Mic className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Record your story about this craft</p>
                  <Button variant="outline" className="mt-2">
                    <Mic className="mr-2 h-4 w-4" />
                    Record Voice Note
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={generateAIContent}
                disabled={!formData.category || !formData.description || loading}
                className="w-full bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600"
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    AI is crafting your listing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && aiSuggestions && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Review & Customize</CardTitle>
              <CardDescription>
                Our AI has crafted your listing. Feel free to make any adjustments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Product Title</label>
                <Input
                  value={aiSuggestions.title}
                  onChange={(e) => setAiSuggestions(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={aiSuggestions.description}
                  onChange={(e) => setAiSuggestions(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cultural Context</label>
                <Textarea
                  value={aiSuggestions.cultural_context}
                  onChange={(e) => setAiSuggestions(prev => ({ ...prev, cultural_context: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Suggested Price (₹)</label>
                <Input
                  type="number"
                  value={aiSuggestions.price_suggestion}
                  onChange={(e) => setAiSuggestions(prev => ({ ...prev, price_suggestion: e.target.value }))}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">✨ AI Generated Content</h4>
                <p className="text-sm text-blue-700">
                  This content was intelligently crafted based on your inputs and traditional craft knowledge
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back to Edit
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600"
              >
                {loading ? 'Publishing...' : 'Publish to Marketplace'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock products for MVP
    setTimeout(() => {
      const mockProducts = [
        {
          id: "1",
          title: "Handwoven Silk Saree - Traditional Kanchipuram",
          description: "Exquisite silk saree woven with traditional patterns",
          price: 15000,
          category: "textiles",
          artisan: {
            name: "Priya Devi",
            picture: "https://images.unsplash.com/photo-1611574557783-9a50bb34e9f5"
          },
          image: "https://images.unsplash.com/photo-1640292343595-889db1c8262e"
        },
        {
          id: "2",
          title: "Silver Filigree Jewelry Set",
          description: "Delicate silver jewelry crafted using ancient techniques",
          price: 8500,
          category: "jewelry",
          artisan: {
            name: "Ravi Kumar",
            picture: "https://images.unsplash.com/photo-1712210332568-37231ad76a7f"
          },
          image: "https://images.unsplash.com/photo-1506806732259-39c2d0268443"
        },
        {
          id: "3",
          title: "Terracotta Pottery Set",
          description: "Beautiful handmade terracotta pieces for home decor",
          price: 3200,
          category: "pottery",
          artisan: {
            name: "Meera Sharma",
            picture: "https://images.unsplash.com/photo-1611574557783-9a50bb34e9f5"
          },
          image: "https://images.unsplash.com/photo-1662717400948-990d71f9e3a8"
        }
      ];
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-spin text-orange-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Artisan Marketplace</h1>
          <p className="text-gray-600">Discover authentic handmade crafts from talented Indian artisans</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={product.artisan.picture} />
                    <AvatarFallback>{product.artisan.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">{product.artisan.name}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {product.category}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Manage your crafts and connect with customers worldwide</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-600">Active Products</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">4.8</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">₹45,200</div>
                  <div className="text-sm text-gray-600">Monthly Sales</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your craft business efficiently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate('/upload')}
                className="w-full justify-start bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Languages className="mr-2 h-4 w-4" />
                Translate Products
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Story with AI
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest marketplace updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New order received</p>
                  <p className="text-xs text-gray-600">Silver jewelry set - ₹8,500</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Product translated</p>
                  <p className="text-xs text-gray-600">Pottery set now in Hindi & Tamil</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">AI story generated</p>
                  <p className="text-xs text-gray-600">Handwoven saree story updated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<ProductUpload />} />
            <Route path="/marketplace" element={<Marketplace />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;