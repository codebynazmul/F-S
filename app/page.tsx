'use client';

import React, { useState, useMemo } from 'react';
import {
  Compass,
  Sprout,
  Droplets,
  Sun,
  Flame,
  Layers,
  BarChart3,
  Calendar,
  Sparkles,
  HelpCircle,
  FileText,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  MapPin,
  RefreshCw,
  Info,
  Download,
  Share2,
  ShieldCheck,
  Zap,
  Globe,
  Moon,
  LogIn,
  LogOut,
  UserCheck,
  Send,
  Radio,
  SlidersHorizontal,
  Database,
  BellRing,
  Award,
  User,
  Phone,
  Camera,
  Save,
  Lock,
  Mail,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

// --- ALL 64 BANGLADESH DISTRICTS ---
export interface DistrictData {
  id: string;
  name: string;
  nameBn: string;
  division: string;
  lat: number;
  lng: number;
  soil: string;
  rainfall: number;
  temp: number;
  risk: string;
  riskBn: string;
}

const ALL_DISTRICTS: DistrictData[] = [
  {
    "id": "dhaka",
    "name": "Dhaka",
    "nameBn": "ঢাকা",
    "division": "Dhaka",
    "lat": 23.8103,
    "lng": 90.4125,
    "soil": "Madhupur Tract Clay Loam",
    "rainfall": 2040,
    "temp": 26.8,
    "risk": "Urban Runoff & Heat Island",
    "riskBn": "জলাবদ্ধতা ও চরম তাপদাহ"
  },
  {
    "id": "gazipur",
    "name": "Gazipur",
    "nameBn": "গাজীপুর",
    "division": "Dhaka",
    "lat": 24.0023,
    "lng": 90.4264,
    "soil": "Red Brown Terrace Clay",
    "rainfall": 2100,
    "temp": 26.5,
    "risk": "Industrial Runoff & Soil Acidity",
    "riskBn": "মাটির অম্লতা বৃদ্ধি ও উর্বরতা হ্রাস"
  },
  {
    "id": "narayanganj",
    "name": "Narayanganj",
    "nameBn": "নারায়ণগঞ্জ",
    "division": "Dhaka",
    "lat": 23.6238,
    "lng": 90.5,
    "soil": "Old Meghna Estuarine Silt",
    "rainfall": 1980,
    "temp": 26.7,
    "risk": "Seasonal Flash Flooding",
    "riskBn": "মৌসুমি বন্যা ও নদীর ক্ষয়"
  },
  {
    "id": "tangail",
    "name": "Tangail",
    "nameBn": "টাঙ্গাইল",
    "division": "Dhaka",
    "lat": 24.2513,
    "lng": 89.9167,
    "soil": "Jamuna Active Floodplain Silt",
    "rainfall": 1820,
    "temp": 25.8,
    "risk": "Riverbank Erosion & Sand Deposition",
    "riskBn": "নদীভাঙন ও বালুচর সমস্যা"
  },
  {
    "id": "kishoreganj",
    "name": "Kishoreganj",
    "nameBn": "কিশোরগঞ্জ",
    "division": "Dhaka",
    "lat": 24.4449,
    "lng": 90.7766,
    "soil": "Old Brahmaputra Alluvium",
    "rainfall": 2300,
    "temp": 25.6,
    "risk": "Haor Early Flash Flood",
    "riskBn": "হাওরের আগাম পাহাড়ি ঢল"
  },
  {
    "id": "manikganj",
    "name": "Manikganj",
    "nameBn": "মানিকগঞ্জ",
    "division": "Dhaka",
    "lat": 23.8617,
    "lng": 90.0003,
    "soil": "Young Dhaleshwari Alluvium",
    "rainfall": 1900,
    "temp": 26.1,
    "risk": "River Inundation Risk",
    "riskBn": "নদী তীরবর্তী প্লাবন"
  },
  {
    "id": "munshiganj",
    "name": "Munshiganj",
    "nameBn": "মুন্সীগঞ্জ",
    "division": "Dhaka",
    "lat": 23.5422,
    "lng": 90.5305,
    "soil": "Padma-Meghna Silt Loam",
    "rainfall": 2050,
    "temp": 26.6,
    "risk": "Waterlogging in Potato Fields",
    "riskBn": "আলু ক্ষেতে আগাম বর্ষার জলাবদ্ধতা"
  },
  {
    "id": "narsingdi",
    "name": "Narsingdi",
    "nameBn": "নরসিংদী",
    "division": "Dhaka",
    "lat": 23.9193,
    "lng": 90.7176,
    "soil": "Old Brahmaputra Silt Loam",
    "rainfall": 2150,
    "temp": 26.3,
    "risk": "Topsoil Nutrient Leaching",
    "riskBn": "মাটির পুষ্টি উপাদান ক্ষয়"
  },
  {
    "id": "faridpur",
    "name": "Faridpur",
    "nameBn": "ফরিদপুর",
    "division": "Dhaka",
    "lat": 23.6071,
    "lng": 89.8429,
    "soil": "Ganges Meander Alluvium",
    "rainfall": 1780,
    "temp": 26.2,
    "risk": "Severe Riverbank Erosion & Siltation",
    "riskBn": "নদীভাঙন ও বালুচাপ"
  },
  {
    "id": "gopalganj",
    "name": "Gopalganj",
    "nameBn": "গোপালগঞ্জ",
    "division": "Dhaka",
    "lat": 23.0051,
    "lng": 89.8266,
    "soil": "Gopalganj Peat Basin",
    "rainfall": 1850,
    "temp": 26.4,
    "risk": "Peat Basin Waterlogging & Saline Intrusion",
    "riskBn": "পিট মাটির জলাবদ্ধতা ও লবণাক্ততা"
  },
  {
    "id": "madaripur",
    "name": "Madaripur",
    "nameBn": "মাদারীপুর",
    "division": "Dhaka",
    "lat": 23.1641,
    "lng": 90.1897,
    "soil": "Low Ganges Floodplain Clay",
    "rainfall": 1890,
    "temp": 26.3,
    "risk": "Prolonged Monsoon Standing Water",
    "riskBn": "বর্ষায় দীর্ঘস্থায়ী পানি জট"
  },
  {
    "id": "rajbari",
    "name": "Rajbari",
    "nameBn": "রাজবাড়ী",
    "division": "Dhaka",
    "lat": 23.7574,
    "lng": 89.6445,
    "soil": "Padma Sandy Loam",
    "rainfall": 1690,
    "temp": 26.1,
    "risk": "Drought in Rabi Season",
    "riskBn": "রবি মৌসুমে খরা ও পানির সংকট"
  },
  {
    "id": "shariatpur",
    "name": "Shariatpur",
    "nameBn": "শরীয়তপুর",
    "division": "Dhaka",
    "lat": 23.2423,
    "lng": 90.4348,
    "soil": "Active Meghna Estuary Silt",
    "rainfall": 1950,
    "temp": 26.5,
    "risk": "Cyclonic Surges & Tidal Flooding",
    "riskBn": "ঘূর্ণিঝড় ও জোয়ারের প্লাবন"
  },
  {
    "id": "rajshahi",
    "name": "Rajshahi",
    "nameBn": "রাজশাহী",
    "division": "Rajshahi",
    "lat": 24.3745,
    "lng": 88.6042,
    "soil": "High Barind Tract Clay",
    "rainfall": 1420,
    "temp": 26.5,
    "risk": "Severe Groundwater Depletion & Heatwave",
    "riskBn": "ভূগর্ভস্থ পানির তীব্র সংকট ও খরা"
  },
  {
    "id": "bogura",
    "name": "Bogura",
    "nameBn": "বগুড়া",
    "division": "Rajshahi",
    "lat": 24.8465,
    "lng": 89.3777,
    "soil": "Karatoa-Bangali Silt Loam",
    "rainfall": 1720,
    "temp": 25.9,
    "risk": "Subsoil Moisture Deficit in Spring",
    "riskBn": "বসন্তে মাটির আর্দ্রতা সংকট"
  },
  {
    "id": "pabna",
    "name": "Pabna",
    "nameBn": "পাবনা",
    "division": "Rajshahi",
    "lat": 24.0116,
    "lng": 89.2562,
    "soil": "Ganges Alluvial Silt Loam",
    "rainfall": 1580,
    "temp": 26.4,
    "risk": "Dry Spell & Intense Summer Heat",
    "riskBn": "তীব্র গ্রীষ্মকালীন তাপদাহ"
  },
  {
    "id": "sirajganj",
    "name": "Sirajganj",
    "nameBn": "সিরাজগঞ্জ",
    "division": "Rajshahi",
    "lat": 24.4534,
    "lng": 89.7008,
    "soil": "Active Jamuna Floodplain",
    "rainfall": 1750,
    "temp": 26.0,
    "risk": "Heavy Jamuna Erosion & Flooding",
    "riskBn": "যমুনার তীব্র নদীভাঙন ও বন্যা"
  },
  {
    "id": "naogaon",
    "name": "Naogaon",
    "nameBn": "নওগাঁ",
    "division": "Rajshahi",
    "lat": 24.8109,
    "lng": 88.9416,
    "soil": "Level Barind Tract Heavy Clay",
    "rainfall": 1390,
    "temp": 26.2,
    "risk": "Extreme Barind Drought & Tube Well Failure",
    "riskBn": "বরেন্দ্র অঞ্চলের চরম খরা ও গভীর নলকূপ সংকট"
  },
  {
    "id": "natore",
    "name": "Natore",
    "nameBn": "নাটোর",
    "division": "Rajshahi",
    "lat": 24.4206,
    "lng": 88.9324,
    "soil": "Chalan Beel Peaty Basin",
    "rainfall": 1550,
    "temp": 26.3,
    "risk": "Beel Drainage Delay in Autumn",
    "riskBn": "চলনবিল এলাকার বিলম্বিত পানি নিষ্কাশন"
  },
  {
    "id": "chapainawabganj",
    "name": "Chapainawabganj",
    "nameBn": "চাঁপাইনবাবগঞ্জ",
    "division": "Rajshahi",
    "lat": 24.5965,
    "lng": 88.2775,
    "soil": "High Barind & Ganges Alluvium",
    "rainfall": 1320,
    "temp": 26.7,
    "risk": "Lowest National Rainfall & Severe Aridity",
    "riskBn": "দেশের সর্বনিম্ন বৃষ্টিপাত ও তীব্র শুষ্কতা"
  },
  {
    "id": "joypurhat",
    "name": "Joypurhat",
    "nameBn": "জয়পুরহাট",
    "division": "Rajshahi",
    "lat": 25.1015,
    "lng": 89.0277,
    "soil": "Little Jamuna Silt Loam",
    "rainfall": 1580,
    "temp": 25.8,
    "risk": "Pre-Monsoon Drought Shock",
    "riskBn": "প্রাক-বর্ষা খরা ধাক্কা"
  },
  {
    "id": "chattogram",
    "name": "Chattogram",
    "nameBn": "চট্টগ্রাম",
    "division": "Chittagong",
    "lat": 22.3569,
    "lng": 91.7832,
    "soil": "Chittagong Coastal Alluvium",
    "rainfall": 2890,
    "temp": 26.9,
    "risk": "Cyclonic Surge & Saline Inundation",
    "riskBn": "ঘূর্ণিঝড় ও লবণাক্ত জোয়ারের প্লাবন"
  },
  {
    "id": "coxsbazar",
    "name": "Cox's Bazar",
    "nameBn": "কক্সবাজার",
    "division": "Chittagong",
    "lat": 21.4272,
    "lng": 92.0058,
    "soil": "Coastal Beach Sand & Red Acid Clay",
    "rainfall": 3450,
    "temp": 26.8,
    "risk": "Extreme Rainstorms & Hill Erosion",
    "riskBn": "চরম বৃষ্টিপাত ও পাহাড় ধস"
  },
  {
    "id": "cumilla",
    "name": "Cumilla",
    "nameBn": "কুমিল্লা",
    "division": "Chittagong",
    "lat": 23.4607,
    "lng": 91.1809,
    "soil": "Titas Floodplain Silt Loam",
    "rainfall": 2250,
    "temp": 26.4,
    "risk": "Flash Floods from Tripura Hills",
    "riskBn": "পাহাড়ি ঢল ও গোমতী নদীর প্লাবন"
  },
  {
    "id": "feni",
    "name": "Feni",
    "nameBn": "ফেনী",
    "division": "Chittagong",
    "lat": 23.0187,
    "lng": 91.3966,
    "soil": "Muhuri Basin Clay Loam",
    "rainfall": 2680,
    "temp": 26.6,
    "risk": "Muhuri River Flash Flood & Embankment Breach",
    "riskBn": "মুহুরী নদীর বাঁধভাঙা আকস্মিক বন্যা"
  },
  {
    "id": "brahmanbaria",
    "name": "Brahmanbaria",
    "nameBn": "ব্রাহ্মণবাড়িয়া",
    "division": "Chittagong",
    "lat": 23.9571,
    "lng": 91.1119,
    "soil": "Old Meghna Estuarine Silt",
    "rainfall": 2180,
    "temp": 26.3,
    "risk": "Early Season Haor Inundation",
    "riskBn": "আগাম হাওর প্লাবন ও জলাবদ্ধতা"
  },
  {
    "id": "rangamati",
    "name": "Rangamati",
    "nameBn": "রাঙ্গামাটি",
    "division": "Chittagong",
    "lat": 22.7324,
    "lng": 92.2985,
    "soil": "Steep Hill Brown Acid Soil",
    "rainfall": 2900,
    "temp": 25.4,
    "risk": "Topsoil Leaching & Landslides",
    "riskBn": "পাহাড় ধস ও উর্বর মাটির ক্ষয়"
  },
  {
    "id": "bandarban",
    "name": "Bandarban",
    "nameBn": "বান্দরবান",
    "division": "Chittagong",
    "lat": 22.1953,
    "lng": 92.2184,
    "soil": "Shallow Hill Loam on Sandstone",
    "rainfall": 3100,
    "temp": 25.2,
    "risk": "Hill Runoff & Winter Moisture Shortage",
    "riskBn": "শীতকালে পাহাড়ি ঝিরির পানি সংকট"
  },
  {
    "id": "khagrachhari",
    "name": "Khagrachhari",
    "nameBn": "খাগড়াছড়ি",
    "division": "Chittagong",
    "lat": 23.1193,
    "lng": 91.9847,
    "soil": "Hill Slopes with Loamy Texture",
    "rainfall": 2750,
    "temp": 25.6,
    "risk": "Soil Erosion from Heavy Downpours",
    "riskBn": "ভারী বর্ষণে পাহাড়ি মাটি ক্ষয়"
  },
  {
    "id": "noakhali",
    "name": "Noakhali",
    "nameBn": "নোয়াখালী",
    "division": "Chittagong",
    "lat": 22.8696,
    "lng": 91.0993,
    "soil": "Young Meghna Estuarine Coastal Silt",
    "rainfall": 2750,
    "temp": 26.7,
    "risk": "Coastal Salinity & Drainage Congestion",
    "riskBn": "উপকূলীয় লবণাক্ততা ও নিষ্কাশন জট"
  },
  {
    "id": "lakshmipur",
    "name": "Lakshmipur",
    "nameBn": "লক্ষ্মীপুর",
    "division": "Chittagong",
    "lat": 22.9425,
    "lng": 90.8412,
    "soil": "Meghna Estuarine Saline Silt",
    "rainfall": 2350,
    "temp": 26.8,
    "risk": "Tidal Inundation & Rising Salinity",
    "riskBn": "জোয়ারের লোনাপানি প্রবেশ"
  },
  {
    "id": "chandpur",
    "name": "Chandpur",
    "nameBn": "চাঁদপুর",
    "division": "Chittagong",
    "lat": 23.2333,
    "lng": 90.6667,
    "soil": "Meghna-Padma Confluence Silt",
    "rainfall": 2100,
    "temp": 26.6,
    "risk": "Erosion at River Confluence",
    "riskBn": "পদ্মা-মেঘনা মোহনার তীব্র ভাঙন"
  },
  {
    "id": "khulna",
    "name": "Khulna",
    "nameBn": "খুলনা",
    "division": "Khulna",
    "lat": 22.8456,
    "lng": 89.5403,
    "soil": "Ganges Tidal Coastal Clay",
    "rainfall": 1780,
    "temp": 26.8,
    "risk": "High Soil Salinity in Dry Season",
    "riskBn": "শুষ্ক মৌসুমে মাটিতে তীব্র লবণাক্ততা"
  },
  {
    "id": "jashore",
    "name": "Jashore",
    "nameBn": "যশোর",
    "division": "Khulna",
    "lat": 23.1664,
    "lng": 89.2081,
    "soil": "High Ganges Meander Silt Loam",
    "rainfall": 1640,
    "temp": 26.5,
    "risk": "Arsenic in Groundwater & Spring Heat",
    "riskBn": "ভূগর্ভস্থ পানিতে আর্সেনিক ও তাপপ্রবাহ"
  },
  {
    "id": "satkhira",
    "name": "Satkhira",
    "nameBn": "সাতক্ষীরা",
    "division": "Khulna",
    "lat": 22.7185,
    "lng": 89.0705,
    "soil": "Sundarbans Saline Tidal Clay",
    "rainfall": 1710,
    "temp": 26.7,
    "risk": "Severe Soil Salinity & Shrimp Farm Intrusion",
    "riskBn": "চরম লবণাক্ততা ও কৃষি জমিতে লোনাপানি"
  },
  {
    "id": "bagerhat",
    "name": "Bagerhat",
    "nameBn": "বাগেরহাট",
    "division": "Khulna",
    "lat": 22.6516,
    "lng": 89.7859,
    "soil": "Tidal Saline Silt Loam",
    "rainfall": 1920,
    "temp": 26.8,
    "risk": "Tidal Surges & Mangrove Saline Edge",
    "riskBn": "জোয়ারের নোনা জলোচ্ছ্বাস"
  },
  {
    "id": "kushtia",
    "name": "Kushtia",
    "nameBn": "কুষ্টিয়া",
    "division": "Khulna",
    "lat": 23.9013,
    "lng": 89.1204,
    "soil": "Calcareous Dark Grey Floodplain",
    "rainfall": 1520,
    "temp": 26.4,
    "risk": "Gorai River Low Winter Inflow",
    "riskBn": "গড়াই নদীর প্রবাহ হ্রাস ও খরা"
  },
  {
    "id": "chuadanga",
    "name": "Chuadanga",
    "nameBn": "চুয়াডাঙ্গা",
    "division": "Khulna",
    "lat": 23.6402,
    "lng": 88.8418,
    "soil": "High Calcareous Alluvium",
    "rainfall": 1460,
    "temp": 26.9,
    "risk": "Extreme Summer Heatwaves (40°C+)",
    "riskBn": "তীব্র তাপদাহ (৪০ ডিগ্রি সেলসিয়াস+)"
  },
  {
    "id": "meherpur",
    "name": "Meherpur",
    "nameBn": "মেহেরপুর",
    "division": "Khulna",
    "lat": 23.7749,
    "lng": 88.6318,
    "soil": "High Ganges Sandy Silt",
    "rainfall": 1410,
    "temp": 26.7,
    "risk": "Severe Pre-Monsoon Moisture Stress",
    "riskBn": "প্রাক-বর্ষা মৌসুমে পানির চরম সংকট"
  },
  {
    "id": "jhenaidah",
    "name": "Jhenaidah",
    "nameBn": "ঝিনাইদহ",
    "division": "Khulna",
    "lat": 23.545,
    "lng": 89.1726,
    "soil": "Ganges Meander Silt Loam",
    "rainfall": 1580,
    "temp": 26.5,
    "risk": "Groundwater Level Declining",
    "riskBn": "ভূগর্ভস্থ পানির স্তর দ্রুত নিচে নামা"
  },
  {
    "id": "magura",
    "name": "Magura",
    "nameBn": "মাগুরা",
    "division": "Khulna",
    "lat": 23.4873,
    "lng": 89.4199,
    "soil": "Nabaganga Floodplain Loam",
    "rainfall": 1680,
    "temp": 26.4,
    "risk": "Periodic Rabi Season Dry Spells",
    "riskBn": "রবি মৌসুমে অনাবৃষ্টি ও খরা"
  },
  {
    "id": "narail",
    "name": "Narail",
    "nameBn": "নড়াইল",
    "division": "Khulna",
    "lat": 23.1725,
    "lng": 89.5127,
    "soil": "Chitra-Kalia Clay Loam",
    "rainfall": 1720,
    "temp": 26.5,
    "risk": "Seasonal Siltation & Water Trapping",
    "riskBn": "নদীর নাব্যতা হ্রাস ও জলাবদ্ধতা"
  },
  {
    "id": "barishal",
    "name": "Barishal",
    "nameBn": "বরিশাল",
    "division": "Barishal",
    "lat": 22.701,
    "lng": 90.3535,
    "soil": "Ganges Tidal Floodplain Non-Saline Clay",
    "rainfall": 2180,
    "temp": 26.8,
    "risk": "Tidal Inundation & Rising Sea Level",
    "riskBn": "জোয়ারের প্লাবন ও জলবায়ু পরিবর্তন ঝুঁকি"
  },
  {
    "id": "patuakhali",
    "name": "Patuakhali",
    "nameBn": "পটুয়াখালী",
    "division": "Barishal",
    "lat": 22.3596,
    "lng": 90.3299,
    "soil": "Coastal Saline Clay",
    "rainfall": 2520,
    "temp": 26.9,
    "risk": "Dry Season Saline Capillary Rise",
    "riskBn": "মাটির উপরিতলে লবণের আস্তরণ"
  },
  {
    "id": "bhola",
    "name": "Bhola",
    "nameBn": "ভোলা",
    "division": "Barishal",
    "lat": 22.6859,
    "lng": 90.6481,
    "soil": "Active Lower Meghna Island Silt",
    "rainfall": 2390,
    "temp": 26.8,
    "risk": "Severe Island River Erosion & Cyclones",
    "riskBn": "তীব্র দ্বীপ ক্ষয় ও সামুদ্রিক জলোচ্ছ্বাস"
  },
  {
    "id": "pirojpur",
    "name": "Pirojpur",
    "nameBn": "পিরোজপুর",
    "division": "Barishal",
    "lat": 22.5841,
    "lng": 89.972,
    "soil": "Baleshwar Tidal Clay Loam",
    "rainfall": 2200,
    "temp": 26.7,
    "risk": "Tidal Flooding in Aman Season",
    "riskBn": "আমন মৌসুমে জোয়ারের পানি বৃদ্ধি"
  },
  {
    "id": "barguna",
    "name": "Barguna",
    "nameBn": "বরগুনা",
    "division": "Barishal",
    "lat": 22.1587,
    "lng": 90.1256,
    "soil": "Saline Coastal Acid Sulfate Clay",
    "rainfall": 2580,
    "temp": 26.9,
    "risk": "High Surface Water Salinity in March-April",
    "riskBn": "চৈত্র-বৈশাখ মাসে সেচের পানিতে উচ্চ লবণ"
  },
  {
    "id": "jhalokathi",
    "name": "Jhalokathi",
    "nameBn": "ঝালকাঠি",
    "division": "Barishal",
    "lat": 22.6406,
    "lng": 90.1987,
    "soil": "Lowland Tidal Clay Loam",
    "rainfall": 2150,
    "temp": 26.7,
    "risk": "Waterlogging in Betel Nut & Guava Orchards",
    "riskBn": "পেয়ারা ও সুপারির বাগানে জলাবদ্ধতা"
  },
  {
    "id": "sylhet",
    "name": "Sylhet",
    "nameBn": "সিলেট",
    "division": "Sylhet",
    "lat": 24.8949,
    "lng": 91.8687,
    "soil": "Surma-Kushiyara Alluvium & Acid Peat",
    "rainfall": 4180,
    "temp": 25.2,
    "risk": "Extreme Rainfall & Early Flash Floods",
    "riskBn": "দেশের সর্বোচ্চ বৃষ্টিপাত ও আকস্মিক পাহাড়ি ঢল"
  },
  {
    "id": "moulvibazar",
    "name": "Moulvibazar",
    "nameBn": "মৌলভীবাজার",
    "division": "Sylhet",
    "lat": 24.4829,
    "lng": 91.7774,
    "soil": "Acid Brown Tea Soil & Basin Clay",
    "rainfall": 3400,
    "temp": 25.5,
    "risk": "Hailstorm Damage & Flash Floods",
    "riskBn": "শিলাবৃষ্টির ক্ষতি ও মনু নদীর আকস্মিক বন্যা"
  },
  {
    "id": "habiganj",
    "name": "Habiganj",
    "nameBn": "হবিগঞ্জ",
    "division": "Sylhet",
    "lat": 24.3749,
    "lng": 91.4155,
    "soil": "Haor Peat & Silt Loam",
    "rainfall": 2850,
    "temp": 25.8,
    "risk": "Boro Crop Damage from Sudden Flooding",
    "riskBn": "হাওরে বোরো ধান কাটার আগে আগাম বন্যা"
  },
  {
    "id": "sunamganj",
    "name": "Sunamganj",
    "nameBn": "সুনামগঞ্জ",
    "division": "Sylhet",
    "lat": 25.0658,
    "lng": 91.395,
    "soil": "Low Basin Deep Haor Clay",
    "rainfall": 4850,
    "temp": 25.0,
    "risk": "Catastrophic Meghalaya Flash Inundation",
    "riskBn": "মেঘালয় থেকে নেমে আসা বিধ্বংসী পাহাড়ি ঢল"
  },
  {
    "id": "rangpur",
    "name": "Rangpur",
    "nameBn": "রংপুর",
    "division": "Rangpur",
    "lat": 25.7439,
    "lng": 89.2752,
    "soil": "Tista Meander Silt Loam",
    "rainfall": 2150,
    "temp": 25.3,
    "risk": "Winter Cold Waves & Summer Dry Spells",
    "riskBn": "শীতকালীন তীব্র শৈত্যপ্রবাহ ও গ্রীষ্মের খরা"
  },
  {
    "id": "dinajpur",
    "name": "Dinajpur",
    "nameBn": "দিনাজপুর",
    "division": "Rangpur",
    "lat": 25.6217,
    "lng": 88.6355,
    "soil": "Old Himalayan Piedmont Sandy Loam",
    "rainfall": 1950,
    "temp": 25.1,
    "risk": "Low Soil Water Holding Capacity & Heat Shock",
    "riskBn": "বেলে দোআঁশ মাটিতে দ্রুত আর্দ্রতা হারানো"
  },
  {
    "id": "gaibandha",
    "name": "Gaibandha",
    "nameBn": "গাইবান্ধা",
    "division": "Rangpur",
    "lat": 25.3288,
    "lng": 89.5407,
    "soil": "Teesta-Brahmaputra Floodplain",
    "rainfall": 2080,
    "temp": 25.5,
    "risk": "Severe Brahmaputra River Sand Deposition",
    "riskBn": "ব্রহ্মপুত্রের বালুচর জমা ও নদীভাঙন"
  },
  {
    "id": "kurigram",
    "name": "Kurigram",
    "nameBn": "কুড়িগ্রাম",
    "division": "Rangpur",
    "lat": 25.8054,
    "lng": 89.6362,
    "soil": "Active Dharla-Dudhkumar Alluvium",
    "rainfall": 2450,
    "temp": 25.2,
    "risk": "Multiple Flash Floods & Chilly Winter",
    "riskBn": "বারবার পাহাড়ি বন্যা ও তীব্র শীত"
  },
  {
    "id": "lalmonirhat",
    "name": "Lalmonirhat",
    "nameBn": "লালমনিরহাট",
    "division": "Rangpur",
    "lat": 25.9923,
    "lng": 89.2847,
    "soil": "Teesta Sandy Alluvium",
    "rainfall": 2300,
    "temp": 25.0,
    "risk": "Teesta Barrage Water Shortage in Spring",
    "riskBn": "তিস্তায় চৈত্র মাসে চরম পানির সংকট"
  },
  {
    "id": "nilphamari",
    "name": "Nilphamari",
    "nameBn": "নীলফামারী",
    "division": "Rangpur",
    "lat": 25.9318,
    "lng": 88.856,
    "soil": "Tista Silt Loam",
    "rainfall": 2180,
    "temp": 25.1,
    "risk": "Unpredictable Monsoon Onset",
    "riskBn": "অনিয়মিত বর্ষা ও খরা"
  },
  {
    "id": "panchagarh",
    "name": "Panchagarh",
    "nameBn": "পঞ্চগড়",
    "division": "Rangpur",
    "lat": 26.3411,
    "lng": 88.5542,
    "soil": "Himalayan Piedmont Acid Coarse Sand/Loam",
    "rainfall": 2400,
    "temp": 24.5,
    "risk": "Lowest Winter Temperatures (Cold Waves)",
    "riskBn": "দেশের সর্বনিম্ন তাপমাত্রা ও তীব্র শৈত্যপ্রবাহ"
  },
  {
    "id": "thakurgaon",
    "name": "Thakurgaon",
    "nameBn": "ঠাকুরগাঁও",
    "division": "Rangpur",
    "lat": 26.0337,
    "lng": 88.4617,
    "soil": "Old Himalayan Piedmont Loam",
    "rainfall": 2050,
    "temp": 24.8,
    "risk": "Rapid Topsoil Moisture Evaporation",
    "riskBn": "মাটির আর্দ্রতা দ্রুত শুকিয়ে যাওয়া"
  },
  {
    "id": "mymensingh",
    "name": "Mymensingh",
    "nameBn": "ময়মনসিংহ",
    "division": "Mymensingh",
    "lat": 24.7471,
    "lng": 90.4203,
    "soil": "Old Brahmaputra Floodplain Silt Loam",
    "rainfall": 2240,
    "temp": 25.7,
    "risk": "Seasonal River Siltation & Water Infiltration",
    "riskBn": "ব্রহ্মপুত্রের নাব্যতা সংকট ও বালু সমস্যা"
  },
  {
    "id": "jamalpur",
    "name": "Jamalpur",
    "nameBn": "জামালপুর",
    "division": "Mymensingh",
    "lat": 24.9375,
    "lng": 89.9378,
    "soil": "Jamuna-Brahmaputra Alluvium",
    "rainfall": 2050,
    "temp": 25.9,
    "risk": "Severe Monsoon Jamuna Inundation",
    "riskBn": "যমুনা নদীর ভয়াবহ বন্যা ও নদীভাঙন"
  },
  {
    "id": "netrokona",
    "name": "Netrokona",
    "nameBn": "নেত্রকোণা",
    "division": "Mymensingh",
    "lat": 24.8834,
    "lng": 90.7279,
    "soil": "Piedmont Basin Heavy Clay & Haor Peat",
    "rainfall": 2980,
    "temp": 25.3,
    "risk": "Garo Hills Flash Inundation",
    "riskBn": "গারো পাহাড় থেকে নেমে আসা আকস্মিক পাহাড়ি ঢল"
  },
  {
    "id": "sherpur",
    "name": "Sherpur",
    "nameBn": "শেরপুর",
    "division": "Mymensingh",
    "lat": 25.0205,
    "lng": 90.0153,
    "soil": "Northern Piedmont Silt Loam",
    "rainfall": 2420,
    "temp": 25.4,
    "risk": "Wild Elephant-Crop Conflict & Hill Flash Floods",
    "riskBn": "পাহাড়ি ঢল ও ফসলে বালু জমা"
  }
];

// --- CROP DATABASE WITH BANGLA TRANSLATIONS ---
interface CropInfo {
  id: string;
  name: string;
  nameBn: string;
  family: string;
  familyBn: string;
  category: string;
  categoryBn: string;
  waterDemand: string;
  waterDemandBn: string;
  waterMm: number;
  nutrientDemand: string;
  nutrientDemandBn: string;
  nBalanceKgHa: number;
  rootingDepth: string;
  rootingDepthBn: string;
  heatTolerance: string;
  droughtTolerance: string;
  growingPeriodDays: number;
  carbonScore: number;
}

const CROP_DATABASE: Record<string, CropInfo> = {
  rice_boro: {
    id: 'rice_boro',
    name: 'Boro Rice (High-Yield Paddy)',
    nameBn: 'বোরো ধান (উচ্চ ফলনশীল)',
    family: 'Poaceae',
    familyBn: 'ঘাস জাতীয়',
    category: 'Cereal',
    categoryBn: 'দানাশস্য',
    waterDemand: 'Very High',
    waterDemandBn: 'চরম মাত্রার পানি',
    waterMm: 1250,
    nutrientDemand: 'Heavy Depleter (NPK)',
    nutrientDemandBn: 'মাটির সার অপচয়কারী',
    nBalanceKgHa: -95,
    rootingDepth: 'Shallow (0-25cm)',
    rootingDepthBn: 'অগভীর শিকড় (০-২৫ সেমি)',
    heatTolerance: 'Medium',
    droughtTolerance: 'Low',
    growingPeriodDays: 145,
    carbonScore: 3
  },
  rice_aman: {
    id: 'rice_aman',
    name: 'Ropa Aman (Rainfed Rice)',
    nameBn: 'রোপা আমন ধান (বৃষ্টি নির্ভর)',
    family: 'Poaceae',
    familyBn: 'ঘাস জাতীয়',
    category: 'Cereal',
    categoryBn: 'দানাশস্য',
    waterDemand: 'High',
    waterDemandBn: 'উচ্চ পানি',
    waterMm: 750,
    nutrientDemand: 'Depleter',
    nutrientDemandBn: 'পুষ্টি ক্ষয়কারী',
    nBalanceKgHa: -65,
    rootingDepth: 'Shallow (0-30cm)',
    rootingDepthBn: 'অগভীর শিকড় (০-৩০ সেমি)',
    heatTolerance: 'High',
    droughtTolerance: 'Medium',
    growingPeriodDays: 130,
    carbonScore: 4
  },
  wheat: {
    id: 'wheat',
    name: 'Wheat (Gom)',
    nameBn: 'গম (বারি গম ৩৩)',
    family: 'Poaceae',
    familyBn: 'ঘাস জাতীয়',
    category: 'Cereal',
    categoryBn: 'দানাশস্য',
    waterDemand: 'Medium',
    waterDemandBn: 'মাঝারি পানি',
    waterMm: 380,
    nutrientDemand: 'Moderate Depleter',
    nutrientDemandBn: 'মাঝারি সার গ্রহণকারী',
    nBalanceKgHa: -50,
    rootingDepth: 'Medium (30-60cm)',
    rootingDepthBn: 'মাঝারি শিকড় (৩০-৬০ সেমি)',
    heatTolerance: 'Low',
    droughtTolerance: 'Medium',
    growingPeriodDays: 110,
    carbonScore: 5
  },
  lentil: {
    id: 'lentil',
    name: 'Lentil (Masoor Dal)',
    nameBn: 'মসুর ডাল (বারি মসুর ৮)',
    family: 'Fabaceae (Legume)',
    familyBn: 'শিম্বী জাতীয় (ডাল)',
    category: 'Legume',
    categoryBn: 'ডাল ও নাইট্রোজেন সংগ্রাহক',
    waterDemand: 'Low',
    waterDemandBn: 'খুব কম পানি',
    waterMm: 210,
    nutrientDemand: 'Restorer (Fixes Nitrogen)',
    nutrientDemandBn: 'নাইট্রোজেন উৎপাদক (জমি উর্বর করে)',
    nBalanceKgHa: +45,
    rootingDepth: 'Medium (30-60cm)',
    rootingDepthBn: 'মাঝারি শিকড় (৩০-৬০ সেমি)',
    heatTolerance: 'Medium',
    droughtTolerance: 'High',
    growingPeriodDays: 95,
    carbonScore: 8
  },
  chickpea: {
    id: 'chickpea',
    name: 'Chickpea (Chhola)',
    nameBn: 'ছোলা (বরেন্দ্র উপযোগী)',
    family: 'Fabaceae (Legume)',
    familyBn: 'শিম্বী জাতীয় (ডাল)',
    category: 'Legume',
    categoryBn: 'ডাল ও নাইট্রোজেন সংগ্রাহক',
    waterDemand: 'Low',
    waterDemandBn: 'খুব কম পানি',
    waterMm: 230,
    nutrientDemand: 'Restorer (Fixes Nitrogen)',
    nutrientDemandBn: 'প্রাকৃতিক নাইট্রোজেন উৎপাদক',
    nBalanceKgHa: +55,
    rootingDepth: 'Deep Taproot (70-130cm)',
    rootingDepthBn: 'গভীর প্রধান শিকড় (৭০-১৩০ সেমি)',
    heatTolerance: 'High',
    droughtTolerance: 'High',
    growingPeriodDays: 100,
    carbonScore: 8
  },
  mustard: {
    id: 'mustard',
    name: 'Mustard (Shorisha)',
    nameBn: 'সরিষা (বারি সরিষা ১৪/১৭)',
    family: 'Brassicaceae',
    familyBn: 'সরিষা জাতীয়',
    category: 'Oilseed',
    categoryBn: 'তৈলবীজ',
    waterDemand: 'Low',
    waterDemandBn: 'স্বল্প পানি',
    waterMm: 250,
    nutrientDemand: 'Light',
    nutrientDemandBn: 'স্বল্প সার গ্রহণকারী',
    nBalanceKgHa: -30,
    rootingDepth: 'Medium (30-60cm)',
    rootingDepthBn: 'মাঝারি শিকড়',
    heatTolerance: 'Medium',
    droughtTolerance: 'Medium',
    growingPeriodDays: 80,
    carbonScore: 6
  },
  maize: {
    id: 'maize',
    name: 'Hybrid Maize (Bhutta)',
    nameBn: 'হাইব্রিড ভুট্টা',
    family: 'Poaceae',
    familyBn: 'ঘাস জাতীয়',
    category: 'Cereal',
    categoryBn: 'দানাশস্য',
    waterDemand: 'Medium',
    waterDemandBn: 'মাঝারি পানি',
    waterMm: 490,
    nutrientDemand: 'Heavy Depleter',
    nutrientDemandBn: 'উচ্চ সার গ্রহণকারী',
    nBalanceKgHa: -75,
    rootingDepth: 'Deep (60-120cm)',
    rootingDepthBn: 'গভীর শিকড় (৬০-১২০ সেমি)',
    heatTolerance: 'High',
    droughtTolerance: 'Medium',
    growingPeriodDays: 120,
    carbonScore: 7
  },
  mungbean: {
    id: 'mungbean',
    name: 'Green Mungbean (Mug Dal)',
    nameBn: 'মুগ ডাল (সবুজ সার)',
    family: 'Fabaceae (Legume)',
    familyBn: 'শিম্বী জাতীয় (ডাল)',
    category: 'Legume / Green Manure',
    categoryBn: 'ডাল ও সবুজ সার',
    waterDemand: 'Low',
    waterDemandBn: 'খুব কম পানি',
    waterMm: 190,
    nutrientDemand: 'Restorer (Fixes Nitrogen)',
    nutrientDemandBn: 'নাইট্রোজেন উৎপাদক ও জৈব সার',
    nBalanceKgHa: +50,
    rootingDepth: 'Medium (30-60cm)',
    rootingDepthBn: 'মাঝারি শিকড়',
    heatTolerance: 'High',
    droughtTolerance: 'High',
    growingPeriodDays: 65,
    carbonScore: 9
  }
};



export default function FieldShiftApp() {
  const [lang, setLang] = useState<'bn' | 'en'>('en');

  // Theme state: 'day' = light sky blue + white, 'night' = deep dark gray
  const [theme, setTheme] = useState<'day' | 'night'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fs-theme');
        if (saved === 'night' || saved === 'day') return saved;
      } catch {}
    }
    return 'day';
  });

  // Sidebar drawer state — hidden by default, opened via floating button
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // User Authentication State: null by default → renders clean login screen
  const [user, setUser] = useState<{
    name: string;
    email: string;
    phone: string;
    initials: string;
    role: 'farmer' | 'admin';
  } | null>(null);

  // Active Main Navigation Tab — includes new 'settings' tab
  const [activeTab, setActiveTab] = useState<
    'rotation' | 'whatif' | 'analytics' | 'nasa' |
    'farm_profile' | 'user_account' | 'settings' |
    'admin' | 'report'
  >('rotation');

  // Selected Bangladesh District (Default: Rajshahi)
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajshahi');
  const selectedDistrict = useMemo(() => {
    return ALL_DISTRICTS.find(d => d.id === selectedDistrictId) || ALL_DISTRICTS[0];
  }, [selectedDistrictId]);

  // Farm Setup State
  const [farmSizeBigha, setFarmSizeBigha] = useState<number>(8.5);
  const [soilType, setSoilType] = useState<string>('Clay Loam');
  const [soilPh, setSoilPh] = useState<number>(6.5);
  const [soilOrganicMatter, setSoilOrganicMatter] = useState<number>(1.2);
  const [irrigationType, setIrrigationType] = useState<string>('Deep Tube Well');

  // User Profile Edit State
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<boolean>(false);

  // What-If Simulation Sliders
  const [simRainfallDelta, setSimRainfallDelta] = useState<number>(-25);
  const [simTempDelta, setSimTempDelta] = useState<number>(1.5);
  const [simIrrigationConstraint, setSimIrrigationConstraint] = useState<number>(35);

  // Crop Rotation Plans
  const [traditionalPlan, setTraditionalPlan] = useState<string[]>([
    'rice_boro', 'rice_aman', 'rice_boro', 'rice_aman'
  ]);
  const [recommendedPlan, setRecommendedPlan] = useState<string[]>([
    'mustard', 'chickpea', 'rice_aman', 'mungbean'
  ]);

  // Admin Broadcast Alert State
  const [alertBroadcastSent, setAlertBroadcastSent] = useState<boolean>(false);
  const [adminDivision, setAdminDivision] = useState<string>('Rajshahi');
  const [adminWarningType, setAdminWarningType] = useState<string>('খরা ও ভূগর্ভস্থ পানি সতর্কতা');

  // === LOGIN FORM STATE ===
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [phoneOtp, setPhoneOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // === ADMIN CREDENTIALS ===
  const ADMIN_EMAIL = 'spiderx@gmail.com';
  const ADMIN_PASSWORD = 'spiderx2026';

  // Apply theme to <html data-theme> + persist
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    try { localStorage.setItem('fs-theme', theme); } catch {}
  }, [theme]);

  // ===== Login handlers =====
  const handleSendOtp = () => {
    if (phoneInput.replace(/\D/g, '').length >= 10) {
      setOtpSent(true);
      setLoginError('');
    } else {
      setLoginError('Please enter a valid mobile number.');
    }
  };

  const handlePhoneLogin = () => {
    if (phoneOtp.length === 6) {
      setUser({
        name: 'Farmer Account',
        email: 'farmer@fieldshift.app',
        phone: `+880 ${phoneInput}`,
        initials: 'FR',
        role: 'farmer'
      });
      setActiveTab('rotation');
      setLoginError('');
    } else {
      setLoginError('Enter the 6-digit OTP code we sent to your phone.');
    }
  };

  const handleGoogleLogin = () => {
    setUser({
      name: 'Google Farmer',
      email: 'farmer@gmail.com',
      phone: '+880 1700-000000',
      initials: 'GF',
      role: 'farmer'
    });
    setActiveTab('rotation');
    setLoginError('');
  };

  const handleEmailLogin = () => {
    const email = loginEmail.trim().toLowerCase();
    if (!email || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }
    if (email === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
      setUser({
        name: 'System Administrator',
        email: ADMIN_EMAIL,
        phone: '—',
        initials: 'AD',
        role: 'admin'
      });
      setActiveTab('admin');
      setLoginError('');
    } else {
      // any non-admin email/password → farmer role for the demo
      const initials = email.slice(0, 2).toUpperCase();
      setUser({
        name: 'Registered Farmer',
        email,
        phone: '+880 1700-000000',
        initials,
        role: 'farmer'
      });
      setActiveTab('rotation');
      setLoginError('');
    }
  };

  const handleSaveProfile = () => {
    if (!user) return;
    setUser({
      ...user,
      name: editName || user.name,
      phone: editPhone || user.phone
    });
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const calculatePlanMetrics = (plan: string[], rainDelta: number = 0, tempDelta: number = 0, irrigConstraint: number = 0) => {
    let totalWaterMm = 0;
    let netNitrogen = 0;
    let carbonTotal = 0;
    let droughtScoreSum = 0;
    let families = new Set<string>();

    plan.forEach(id => {
      const c = CROP_DATABASE[id] || CROP_DATABASE['wheat'];
      totalWaterMm += c.waterMm;
      netNitrogen += c.nBalanceKgHa;
      carbonTotal += c.carbonScore;
      families.add(c.family);
      droughtScoreSum += (c.droughtTolerance === 'High' ? 90 : c.droughtTolerance === 'Medium' ? 65 : 35);
    });

    const diversity = families.size / plan.length;
    const avgDrought = droughtScoreSum / plan.length;
    const avgCarbon = carbonTotal / plan.length;

    const waterDeficit = Math.max(0, (totalWaterMm * (1 + tempDelta * 0.05)) - (selectedDistrict.rainfall * (1 + rainDelta / 100)));
    const stressFactor = 1 + (irrigConstraint / 45);

    const soilScore = Math.min(100, Math.max(15, Math.round(
      (avgCarbon * 5) +
      (netNitrogen > 0 ? 30 : netNitrogen > -100 ? 15 : 0) +
      (diversity * 35)
    )));

    const waterStress = Math.min(100, Math.max(10, Math.round(
      ((waterDeficit / 1100) * 100) * stressFactor
    )));

    const yieldResilience = Math.min(100, Math.max(10, Math.round(
      avgDrought - (tempDelta * 5) - (Math.abs(rainDelta) * 0.35) + (diversity * 20)
    )));

    return {
      totalWaterMm,
      netNitrogen,
      soilScore,
      waterStress,
      yieldResilience,
      diversityPct: Math.round(diversity * 100)
    };
  };

  const tradMetrics = useMemo(() => calculatePlanMetrics(traditionalPlan, 0, 0, 0), [traditionalPlan, selectedDistrict]);
  const recMetrics = useMemo(() => calculatePlanMetrics(recommendedPlan, 0, 0, 0), [recommendedPlan, selectedDistrict]);
  const simTradMetrics = useMemo(() => calculatePlanMetrics(traditionalPlan, simRainfallDelta, simTempDelta, simIrrigationConstraint), [traditionalPlan, selectedDistrict, simRainfallDelta, simTempDelta, simIrrigationConstraint]);
  const simRecMetrics = useMemo(() => calculatePlanMetrics(recommendedPlan, simRainfallDelta, simTempDelta, simIrrigationConstraint), [recommendedPlan, selectedDistrict, simRainfallDelta, simTempDelta, simIrrigationConstraint]);

  // Theme flag — used to switch text/border tokens
  const isNight = theme === 'night';

  // Tailwind-friendly token strings (kept short; CSS variables do the heavy lifting)
  const bgMain = isNight ? 'text-slate-100' : 'text-slate-900';
  const bgTopHeader = isNight ? 'glass-strong' : 'glass-strong';
  const bgDistrictBar = isNight ? 'glass-subtle' : 'glass-subtle';
  const bgCard = isNight ? 'glass-strong' : 'glass';
  const bgSubCard = isNight ? 'glass-subtle' : 'glass-subtle';
  const textTitle = isNight ? 'text-slate-50' : 'text-slate-900';
  const primaryBtn =
    'btn-popup bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md';

  // Navigation Items — NO numbers, NO vibe-coded emojis (use clean lucide icons only)
  const navMenuItems = [
    { id: 'rotation',     labelBn: 'ফসল পর্যায়ক্রম অপটিমাইজার',     labelEn: 'Crop Rotation Optimizer',     icon: Sprout },
    { id: 'whatif',       labelBn: 'জলবায়ু সিমুলেটর (হোয়াট-ইফ)', labelEn: 'What-If Climate Simulator',    icon: Sliders },
    { id: 'analytics',    labelBn: 'মাটি ও পানির তুলনা',           labelEn: 'Soil & Water Analytics',       icon: BarChart3 },
    { id: 'nasa',         labelBn: 'নাসা আর্থ পর্যবেক্ষণ',         labelEn: 'NASA Earth Telemetry',         icon: Globe },
    { id: 'farm_profile', labelBn: 'খামার ও মাটির ল্যাব তথ্য',     labelEn: 'Farm & Soil Profile',          icon: Layers },
    { id: 'user_account', labelBn: 'আমার একাউন্ট ও প্রোফাইল',       labelEn: 'My Account',                   icon: User },
    { id: 'settings',     labelBn: 'সেটিংস ও থিম',                labelEn: 'Settings & Theme',             icon: SlidersHorizontal },
    ...(user?.role === 'admin'
      ? [{ id: 'admin', labelBn: 'অ্যাডমিন কন্ট্রোল ও সতর্কতা বোর্ড', labelEn: 'Admin Control & Broadcast', icon: Radio }]
      : []),
    { id: 'report',       labelBn: 'কৃষক কর্মপরিকল্পনা রিপোর্ট',     labelEn: 'Farm Action Dossier',          icon: FileText },
  ];

  // =========================================================================
  // VIEW 1: LOGIN PAGE — YouTube video background (80% opacity) + glass card
  //   Layout (top → bottom):
  //     1. Phone Number + OTP verification
  //     2. Sign in with Google
  //     3. Email + Password
  // =========================================================================
  // Background video lives on Google Drive (user-supplied folder).
  // File ID: 15YYRvFlfpZEEx_mEdfK98R1RRdXmgNFC
  // File:   YTDown.com_YouTube_Media_enGTk409iQk_Gladiator-Wheat-Field-scene_001_1080p.mp4
  // We use a native <video> element pointed at Drive's direct-download
  // endpoint — this enables autoPlay + mute + loop with no Drive UI chrome.
  // Drive serves the file via the /uc?export=download endpoint; the
  // confirm=t param bypasses the "virus scan" warning for larger files.
  const DRIVE_VIDEO_ID = '15YYRvFlfpZEEx_mEdfK98R1RRdXmgNFC';
  const driveDirectUrl = `https://drive.usercontent.google.com/download?id=${DRIVE_VIDEO_ID}&export=download&confirm=t`;

  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col font-sans antialiased ${bgMain}`}>
        {/* Google Drive video background — autoPlay + muted + loop, 100% visible */}
        <video
          className="fs-video-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/login-bg-preview.png"
        >
          <source src={driveDirectUrl} type="video/mp4" />
        </video>

        {/* Header — 50% transparent so video shows through behind it */}
        <header className="fs-login-header fs-login-header-wrap border-b border-white/10 px-6 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Project logo — circular NASA Space Apps agriculture mark */}
            <img
              src="/logo.png"
              alt="Field Shift logo"
              className="h-12 w-12 rounded-full object-cover shadow-md btn-popup"
            />
            <div>
              <h1 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Field Shift
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-xl border border-sky-500/25 bg-white/50 backdrop-blur-md">
              <button
                onClick={() => setLang('bn')}
                className={`btn-popup px-3 py-1 rounded-lg text-xs font-bold ${
                  lang === 'bn' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >বাংলা</button>
              <button
                onClick={() => setLang('en')}
                className={`btn-popup px-3 py-1 rounded-lg text-xs font-bold ${
                  lang === 'en' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >EN</button>
            </div>
          </div>
        </header>

        {/* Main login card */}
        <main className="fs-login-wrap flex-1 flex items-center justify-center p-4 lg:p-12">
          <div className="fs-login-card rounded-4xl p-8 lg:p-10 w-full max-w-md space-y-6 card-popup">

            {/* Brand mark */}
            <div className="text-center space-y-3">
              <img
                src="/logo.png"
                alt="Field Shift logo"
                className="h-20 w-20 rounded-full object-cover shadow-xl mx-auto btn-popup ring-4 ring-white/40"
              />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {lang === 'bn' ? 'ফিল্ড শিফট লগইন' : 'Welcome to Field Shift'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                {lang === 'bn'
                  ? 'ফোন ওটিপি, গুগল অথবা ইমেইল দিয়ে প্রবেশ করুন।'
                  : 'Sign in with Phone OTP, Google, or your Email to access NASA-powered crop planning.'}
              </p>
            </div>

            {loginError && (
              <div className="text-[11px] font-bold text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {loginError}
              </div>
            )}

            {/* === STEP 1: PHONE NUMBER + OTP VERIFICATION (top) === */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-sky-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {lang === 'bn' ? '১. ফোন নম্বর যাচাই' : 'Phone Verification'}
                </h3>
              </div>

              <div className="flex items-center gap-2 glass-subtle rounded-xl px-3 py-2.5">
                <span className="font-bold text-slate-500 text-xs">+880</span>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  disabled={otpSent}
                  placeholder="1XXXXXXXXX"
                  className="w-full bg-transparent outline-none font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  className={`btn-popup w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 ${primaryBtn}`}
                >
                  <Send className="h-4 w-4" />
                  <span>{lang === 'bn' ? 'ওটিপি পাঠান' : 'Send OTP Code'}</span>
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-2 glass-subtle rounded-xl px-3 py-2.5">
                    <Lock className="h-4 w-4 text-sky-500" />
                    <input
                      type="text"
                      maxLength={6}
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit code"
                      className="w-full bg-transparent outline-none font-bold text-sm tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    onClick={handlePhoneLogin}
                    className={`btn-popup w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 ${primaryBtn}`}
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span>{lang === 'bn' ? 'ওটিপি যাচাই করে প্রবেশ করুন' : 'Verify & Continue'}</span>
                  </button>
                </>
              )}
            </section>

            {/* divider */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-sky-500/15"></div>
              <span className="mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                {lang === 'bn' ? 'অথবা' : 'Or'}
              </span>
              <div className="flex-grow border-t border-sky-500/15"></div>
            </div>

            {/* === STEP 2: GOOGLE SIGN-IN (middle) === */}
            <button
              onClick={handleGoogleLogin}
              className="btn-popup w-full flex items-center justify-center gap-3 py-3 px-5 rounded-2xl glass-subtle border border-sky-500/25 hover:border-sky-500/50 text-slate-800 dark:text-slate-100 font-bold text-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{lang === 'bn' ? 'গুগল দিয়ে সাইন ইন করুন' : 'Sign in with Google'}</span>
            </button>

            {/* divider */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-sky-500/15"></div>
              <span className="mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                {lang === 'bn' ? 'ইমেইল ও পাসওয়ার্ড' : 'Email & Password'}
              </span>
              <div className="flex-grow border-t border-sky-500/15"></div>
            </div>

            {/* === STEP 3: EMAIL + PASSWORD (bottom) === */}
            <section className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1 text-slate-600 dark:text-slate-300">
                  {lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                </label>
                <div className="flex items-center gap-2 glass-subtle rounded-xl px-3 py-2.5">
                  <Mail className="h-4 w-4 text-sky-500" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent outline-none font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1 text-slate-600 dark:text-slate-300">
                  {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div className="flex items-center gap-2 glass-subtle rounded-xl px-3 py-2.5">
                  <Lock className="h-4 w-4 text-sky-500" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEmailLogin(); }}
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                onClick={handleEmailLogin}
                className={`btn-popup w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 ${primaryBtn}`}
              >
                <LogIn className="h-4 w-4" />
                <span>{lang === 'bn' ? 'প্রবেশ করুন' : 'Sign In'}</span>
              </button>

              <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 pt-1">
                {lang === 'bn'
                  ? 'অ্যাডমিন অ্যাক্সেস শুধু অনুমোদিত ইমেইল দিয়ে।'
                  : 'Admin access is restricted to authorized credentials.'}
              </p>
            </section>

            <div className="pt-3 text-center text-[10px] text-slate-500 dark:text-slate-400 space-y-1 border-t border-sky-500/10">
              <p className="flex items-center justify-center gap-1.5">
                <img src="/logo.png" alt="" className="h-3 w-3 rounded-full object-cover inline-block" />
                {lang === 'bn' ? 'ওপেন সোর্স পাবলিক ডিসিশন সাপোর্ট টুল' : 'Open Source Public Decision Support Tool'}
              </p>
            </div>

          </div>
        </main>
      </div>
    );
  }


  // =========================================================================
  // VIEW 2: MAIN APPLICATION
  //   - Floating Action Button (bottom-left) opens the navigation drawer
  //   - Sidebar is hidden by default on all screens
  //   - All cards/buttons use glass + popup animation
  // =========================================================================
  return (
    <div className={`min-h-screen ${bgMain} flex font-sans transition-colors duration-300 antialiased`}>

      {/* YouTube-style hamburger (top-left, transparent ghost icon) — toggles the drawer open/closed */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(prev => !prev)}
        className={`fs-fab ${isMobileMenuOpen ? 'is-open' : ''}`}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        title={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* ===================================================================== */}
      {/* NAVIGATION DRAWER (hidden by default, slides in from the left)        */}
      {/* No backdrop / no blur — the menu simply slides in and out.           */}
      {/* ===================================================================== */}
      <aside
        className={`fs-drawer glass-sidebar fixed top-0 bottom-0 left-0 z-50 w-80 shrink-0 h-screen flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top of Drawer: Brand & User Identity Card */}
        <div className="p-5 border-b border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Project logo — circular NASA Space Apps agriculture mark */}
              <img
                src="/logo.png"
                alt="Field Shift logo"
                className="h-11 w-11 rounded-full object-cover shadow-lg shrink-0 btn-popup"
              />
              <div>
                <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'ফিল্ড শিফট' : 'Field Shift'}
                </h1>
                <span className="text-[10px] font-semibold block leading-tight text-sky-600 dark:text-sky-300">
                  {lang === 'bn' ? 'কৃষি ডিসিশন সাপোর্ট সিস্টেম' : 'Agricultural Decision Support System'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-popup p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Card — initials avatar, no emoji */}
          <div className="glass-subtle rounded-2xl border border-white/10 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span
                className="text-sm font-black w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
                style={{
                  background:
                    user.role === 'admin'
                      ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
                      : 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)'
                }}
              >
                {user.initials}
              </span>
              <div className="truncate">
                <h4 className="text-xs font-black truncate text-slate-900 dark:text-white">{user.name}</h4>
                <span className={`text-[10px] font-bold block ${user.role === 'admin' ? 'text-violet-500' : 'text-sky-600 dark:text-sky-300'}`}>
                  {user.role === 'admin' ? (lang === 'bn' ? 'অ্যাডমিন' : 'Admin') : (lang === 'bn' ? 'কৃষক' : 'Farmer')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => { setActiveTab('user_account'); setIsMobileMenuOpen(false); }}
                className="btn-popup p-1.5 text-slate-500 hover:text-sky-600 dark:hover:text-sky-300 rounded-lg hover:bg-white/10"
                title={lang === 'bn' ? 'প্রোফাইল সম্পাদন' : 'Edit Profile'}
              >
                <User className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setUser(null)}
                className="btn-popup p-1.5 text-slate-500 hover:text-red-500 rounded-lg hover:bg-white/10"
                title={lang === 'bn' ? 'লগআউট' : 'Sign Out'}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Center of Drawer: Vertical Navigation Links — NO numbers */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 mb-2 block text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'প্রধান মেন্যু' : 'Main Navigation'}
          </span>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                className={`btn-popup w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left group ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-sky-500'}`} />
                  <span className="leading-snug">{lang === 'bn' ? item.labelBn : item.labelEn}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 shrink-0 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Bottom of Drawer: Language + Theme Quick Toggle */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center p-1 rounded-xl border border-white/10 glass-subtle w-fit">
              <button
                onClick={() => setLang('bn')}
                className={`btn-popup px-2.5 py-1 rounded-lg text-xs font-bold ${
                  lang === 'bn' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >বাংলা</button>
              <button
                onClick={() => setLang('en')}
                className={`btn-popup px-2.5 py-1 rounded-lg text-xs font-bold ${
                  lang === 'en' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >EN</button>
            </div>

            <button
              onClick={() => setTheme(isNight ? 'day' : 'night')}
              className={`btn-popup flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 glass-subtle text-xs font-bold ${
                isNight ? 'text-amber-300' : 'text-sky-600'
              }`}
            >
              {isNight ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{isNight ? (lang === 'bn' ? 'দিন' : 'Day') : (lang === 'bn' ? 'রাত' : 'Night')}</span>
            </button>
          </div>

          <div className="text-[10px] text-center text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'ডেভেলপড বাই SPIDERX' : 'Developed by SPIDERX'}
          </div>
        </div>
      </aside>

      {/* ===================================================================== */}
      {/* MAIN WORKSPACE                                                        */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto ml-0 lg:ml-0">

        {/* TOP STATUS BAR — left padding reserves room for the hamburger button,
            inner content centered with max-w-7xl to align with main content */}
        <header className={`${bgTopHeader} border-b border-sky-500/15 sticky top-0 z-30 pl-16 pr-4 lg:pl-20 lg:pr-8 py-3.5`}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold hidden sm:inline text-slate-600 dark:text-slate-300">
                {lang === 'bn' ? 'নির্বাচিত জেলা:' : 'Selected District:'}
              </span>
              <span className="text-sm lg:text-base font-extrabold flex items-center gap-1.5 text-sky-600 dark:text-sky-300">
                <MapPin className="h-4 w-4 shrink-0" />
                {lang === 'bn' ? selectedDistrict.nameBn : selectedDistrict.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25">
                {selectedDistrict.division} {lang === 'bn' ? 'বিভাগ' : 'Division'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="text-xs font-bold rounded-xl px-3 py-2 border glass-subtle border-sky-500/25 outline-none cursor-pointer max-w-[220px] truncate text-slate-800 dark:text-slate-100"
            >
              {['Dhaka', 'Rajshahi', 'Chittagong', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'].map(divName => (
                <optgroup key={divName} label={`--- ${divName} Division (${ALL_DISTRICTS.filter(d => d.division === divName).length} Districts) ---`}>
                  {ALL_DISTRICTS.filter(d => d.division === divName).map(dist => (
                    <option key={dist.id} value={dist.id}>
                      {lang === 'bn' ? dist.nameBn : dist.name} ({dist.name})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <button
              onClick={() => setActiveTab('report')}
              className={`btn-popup hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs ${primaryBtn}`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'রিপোর্ট' : 'Dossier'}</span>
            </button>
          </div>
          </div>
        </header>

        {/* SUB-BANNER (inner content centered to match main) */}
        <div className={`${bgDistrictBar} px-4 lg:px-8 py-3 border-b border-sky-500/10`}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'মাটি:' : 'Soil:'}</span>
              <strong className={textTitle}>{selectedDistrict.soil}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'বৃষ্টিপাত:' : 'Rainfall:'}</span>
              <strong className="text-sky-600 dark:text-sky-300">{selectedDistrict.rainfall} mm/yr</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'প্রধান ঝুঁকি:' : 'Primary Risk:'}</span>
              <span className="text-amber-500 font-bold">{lang === 'bn' ? selectedDistrict.riskBn : selectedDistrict.risk}</span>
            </div>
          </div>
        </div>

        {/* --- MAIN TAB CONTENT ROUTER (centered horizontally) --- */}
        <main className="p-4 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">


          {/* ======================================================== */}
          {/* TAB: USER ACCOUNT & EDITABLE PROFILE DASHBOARD           */}
          {/* ======================================================== */}
          {activeTab === 'user_account' && (
            <div className="space-y-6 card-rise">
              <div className={`${bgCard} rounded-4xl p-6 lg:p-8 shadow-xl space-y-6`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sky-500/15 gap-4`}>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25">
                      {lang === 'bn' ? 'ব্যবহারকারী একাউন্ট ব্যবস্থাপনা' : 'User Account Management'}
                    </span>
                    <h3 className={`text-xl font-black ${textTitle} mt-1 flex items-center gap-2`}>
                      <User className="h-6 w-6 text-sky-500" />
                      <span>{lang === 'bn' ? 'প্রোফাইল তথ্য ও ড্যাশবোর্ড' : 'Profile Settings & Dashboard'}</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {lang === 'bn'
                        ? 'এখানে আপনি আপনার নাম, মোবাইল নম্বর এবং প্রোফাইল সম্পাদনা করতে পারবেন।'
                        : 'Edit your display name and phone number for farm advisory reports.'}
                    </p>
                  </div>

                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin'
                        ? 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/25'
                        : 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/25'
                    }`}>
                      {user.role === 'admin' ? (lang === 'bn' ? 'অ্যাডমিন একাউন্ট' : 'Admin Role') : (lang === 'bn' ? 'কৃষক একাউন্ট' : 'Farmer Role')}
                    </span>
                  </div>
                </div>

                {/* Profile Edit Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Left: Initials Avatar */}
                  <div className={`${bgSubCard} p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-3`}>
                    <div
                      className="text-4xl font-black w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg text-white"
                      style={{
                        background:
                          user.role === 'admin'
                            ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
                            : 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)'
                      }}
                    >
                      {user.initials}
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${textTitle}`}>{user.name}</span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400">{user.email}</span>
                    </div>
                  </div>

                  {/* Right: Editable Form */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="text-xs font-bold block mb-1 text-slate-600 dark:text-slate-300">
                        {lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
                      </label>
                      <div className={`flex items-center gap-2 glass-subtle rounded-xl px-3 py-2 border border-sky-500/15`}>
                        <User className="h-4 w-4 text-sky-500" />
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder={user.name}
                          className={`w-full bg-transparent outline-none text-sm font-bold ${textTitle}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1 text-slate-600 dark:text-slate-300">
                        {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                      </label>
                      <div className={`flex items-center gap-2 glass-subtle rounded-xl px-3 py-2 border border-sky-500/15`}>
                        <Phone className="h-4 w-4 text-sky-500" />
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder={user.phone}
                          className={`w-full bg-transparent outline-none text-sm font-bold font-mono ${textTitle}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1 text-slate-600 dark:text-slate-300">
                        {lang === 'bn' ? 'সংযুক্ত ইমেইল' : 'Connected Email'}
                      </label>
                      <div className={`flex items-center gap-2 glass-subtle rounded-xl px-3 py-2 text-xs border border-sky-500/15`}>
                        <Mail className="h-4 w-4 text-sky-500" />
                        <span className="font-mono">{user.email}</span>
                        <span className="ml-auto text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                          Verified
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={handleSaveProfile}
                        className={`btn-popup flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs ${primaryBtn}`}
                      >
                        <Save className="h-4 w-4" />
                        <span>{lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Profile Changes'}</span>
                      </button>

                      {profileSaveSuccess && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-300 font-bold flex items-center gap-1.5 card-popup">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{lang === 'bn' ? 'সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: SETTINGS & THEME                                   */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 card-rise">
              <div className={`${bgCard} rounded-4xl p-6 lg:p-8 shadow-xl space-y-6`}>
                <div className="pb-5 border-b border-sky-500/15">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25">
                    {lang === 'bn' ? 'সেটিংস ও পছন্দ' : 'Settings & Preferences'}
                  </span>
                  <h3 className={`text-xl font-black ${textTitle} mt-1 flex items-center gap-2`}>
                    <SlidersHorizontal className="h-6 w-6 text-sky-500" />
                    <span>{lang === 'bn' ? 'থিম ও ভাষা পছন্দ' : 'Theme & Language Preferences'}</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {lang === 'bn'
                      ? 'দিনের মুডে আকাশি নীল ও সাদা থিম থাকে; রাতের মুডে গাঢ় ধূসর থিম চালু হয়।'
                      : 'Day mode uses a light sky-blue + white theme. Night mode switches to a deep dark gray theme.'}
                  </p>
                </div>

                {/* Theme Picker */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme('day')}
                    className={`btn-popup p-5 rounded-2xl border text-left transition-all ${
                      theme === 'day'
                        ? 'border-sky-500 ring-2 ring-sky-500/30 shadow-md'
                        : 'border-sky-500/15 hover:border-sky-500/40'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 100%)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Sun className="h-4 w-4 text-amber-500" />
                        {lang === 'bn' ? 'দিন মুড' : 'Day Mode'}
                      </span>
                      {theme === 'day' && <CheckCircle2 className="h-5 w-5 text-sky-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {lang === 'bn' ? 'আকাশি নীল + সাদা' : 'Light Sky Blue + White'}
                    </p>
                    <div className="mt-3 flex gap-1.5">
                      <span className="h-3 w-3 rounded-full" style={{background:'#F0F9FF'}} />
                      <span className="h-3 w-3 rounded-full" style={{background:'#7DD3FC'}} />
                      <span className="h-3 w-3 rounded-full" style={{background:'#0284C7'}} />
                      <span className="h-3 w-3 rounded-full" style={{background:'#FFFFFF'}} />
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme('night')}
                    className={`btn-popup p-5 rounded-2xl border text-left transition-all ${
                      theme === 'night'
                        ? 'border-sky-500 ring-2 ring-sky-500/30 shadow-md'
                        : 'border-white/10 hover:border-white/25'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, #161819 0%, #1F2937 100%)',
                      color: '#F1F5F9'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black flex items-center gap-2">
                        <Moon className="h-4 w-4 text-amber-300" />
                        {lang === 'bn' ? 'রাত মুড' : 'Night Mode'}
                      </span>
                      {theme === 'night' && <CheckCircle2 className="h-5 w-5 text-sky-300" />}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {lang === 'bn' ? 'গাঢ় ধূসর থিম' : 'Deep Dark Gray Theme'}
                    </p>
                    <div className="mt-3 flex gap-1.5">
                      <span className="h-3 w-3 rounded-full" style={{background:'#161819'}} />
                      <span className="h-3 w-3 rounded-full" style={{background:'#1F2937'}} />
                      <span className="h-3 w-3 rounded-full" style={{background:'#38BDF8'}} />
                      <span className="h-3 w-3 rounded-full" style={{background:'#0B0F14'}} />
                    </div>
                  </button>
                </div>

                {/* Language picker */}
                <div className="pt-2">
                  <label className="text-xs font-bold block mb-2 text-slate-600 dark:text-slate-300">
                    {lang === 'bn' ? 'ভাষা' : 'Language'}
                  </label>
                  <div className="flex items-center p-1 rounded-xl border border-sky-500/15 glass-subtle w-fit">
                    <button onClick={() => setLang('bn')} className={`btn-popup px-4 py-1.5 rounded-lg text-xs font-bold ${lang === 'bn' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}>বাংলা</button>
                    <button onClick={() => setLang('en')} className={`btn-popup px-4 py-1.5 rounded-lg text-xs font-bold ${lang === 'en' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}>English</button>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-sky-500/10">
                  {lang === 'bn'
                    ? 'আপনার থিম পছন্দ ব্রাউজারে সংরক্ষিত হবে এবং পরবর্তী বার অটো-লোড হবে।'
                    : 'Your theme preference is stored in your browser and re-applied on next visit.'}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: CROP ROTATION OPTIMIZER                         */}
          {/* ======================================================== */}
          {activeTab === 'rotation' && (
            <div className="space-y-6 card-rise">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
                <div className={`${bgCard} p-4 rounded-2xl relative overflow-hidden card-rise`}>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>{lang === 'bn' ? 'মাটির স্বাস্থ্য স্কোর' : 'Soil Health Index'}</span>
                    <Sprout className="h-4 w-4 text-sky-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-black text-sky-600 dark:text-sky-300">{recMetrics.soilScore}/100</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-300 font-bold flex items-center">
                      <TrendingUp className="h-3 w-3 mr-0.5" /> +{recMetrics.soilScore - tradMetrics.soilScore}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">
                    {lang === 'bn' ? 'প্রচলিত ধারায় মাত্র' : 'Traditional baseline:'} {tradMetrics.soilScore}/100
                  </span>
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-sky-500"></div>
                </div>

                <div className={`${bgCard} p-4 rounded-2xl relative overflow-hidden card-rise`}>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>{lang === 'bn' ? 'সেচের পানি সাশ্রয়' : 'Annual Water Savings'}</span>
                    <Droplets className="h-4 w-4 text-cyan-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-black text-cyan-600 dark:text-cyan-300">
                      {tradMetrics.totalWaterMm - recMetrics.totalWaterMm} mm
                    </span>
                    <span className="text-xs text-cyan-600 dark:text-cyan-300 font-bold">
                      ~{Math.round(((tradMetrics.totalWaterMm - recMetrics.totalWaterMm) / tradMetrics.totalWaterMm) * 100)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">
                    {lang === 'bn' ? 'ভূগর্ভস্থ পানি রক্ষা পাবে' : 'Prevents aquifer collapse'}
                  </span>
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-cyan-500"></div>
                </div>

                <div className={`${bgCard} p-4 rounded-2xl relative overflow-hidden card-rise`}>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>{lang === 'bn' ? 'প্রাকৃতিক নাইট্রোজেন সঞ্চয়' : 'Nitrogen Balance'}</span>
                    <Layers className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-2xl lg:text-3xl font-black ${recMetrics.netNitrogen >= 0 ? 'text-indigo-600 dark:text-indigo-300' : 'text-amber-500'}`}>
                      {recMetrics.netNitrogen > 0 ? `+${recMetrics.netNitrogen}` : recMetrics.netNitrogen} kg/ha
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">
                    {lang === 'bn' ? 'ইউরিয়া সারের খরচ ৪০% কমবে' : 'Cuts synthetic urea by ~40%'}
                  </span>
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-indigo-500"></div>
                </div>

                <div className={`${bgCard} p-4 rounded-2xl relative overflow-hidden card-rise`}>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>{lang === 'bn' ? 'খরা ও তাপদাহ সহনশীলতা' : 'Climate Resilience'}</span>
                    <ShieldCheck className="h-4 w-4 text-teal-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-black text-teal-600 dark:text-teal-300">{recMetrics.yieldResilience}%</span>
                    <span className="text-xs text-teal-600 dark:text-teal-300 font-bold flex items-center">
                      <TrendingUp className="h-3 w-3 mr-0.5" /> +{recMetrics.yieldResilience - tradMetrics.yieldResilience}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">
                    {lang === 'bn' ? 'নাসা স্ম্যাপ (SMAP) ক্যালিব্রেটেড' : 'SMAP telemetry verified'}
                  </span>
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-teal-500"></div>
                </div>
              </div>

              {/* Side-by-Side Sequences */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* RECOMMENDED PLAN */}
                <div className={`${bgCard} p-5 rounded-4xl border-2 border-sky-500/40 shadow-xl space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
                        <Sparkles className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className={`font-extrabold text-sm lg:text-base ${textTitle}`}>
                          {lang === 'bn' ? 'নাসা-স্মার্ট জলবায়ু সহনশীল ফসল পর্যায়ক্রম' : 'NASA-Adaptive Recommended Rotation'}
                        </h3>
                        <p className="text-xs font-medium text-sky-600 dark:text-sky-300">
                          {lang === 'bn' ? `${selectedDistrict.nameBn} জেলার মাটির জন্য বিশেষভাবে সাজানো` : `Calibrated for ${selectedDistrict.name} agro-ecology`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25">
                      {lang === 'bn' ? 'সর্বোত্তম পরামর্শ' : 'Top Recommendation'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {recommendedPlan.map((cropId, idx) => {
                      const crop = CROP_DATABASE[cropId];
                      return (
                        <div key={idx} className={`${bgSubCard} p-3.5 rounded-2xl flex items-center justify-between gap-3`}>
                          <div className="flex items-center gap-3">
                            <span className="h-7 w-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 bg-sky-600 text-white">
                              {`S${idx + 1}`}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-bold text-xs lg:text-sm ${textTitle}`}>
                                  {lang === 'bn' ? crop.nameBn : crop.name}
                                </h4>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-300">
                                  {lang === 'bn' ? crop.categoryBn : crop.category}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-[11px] mt-1 text-slate-600 dark:text-slate-400">
                                <span>{lang === 'bn' ? 'পানি:' : 'Water:'} <strong className="text-sky-600 dark:text-sky-300">{crop.waterMm}mm</strong></span>
                                <span>{lang === 'bn' ? 'নাইট্রোজেন:' : 'N-Yield:'} <strong className={crop.nBalanceKgHa > 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-500'}>{crop.nBalanceKgHa > 0 ? `+${crop.nBalanceKgHa}` : crop.nBalanceKgHa} kg</strong></span>
                                <span>{lang === 'bn' ? 'শিকড়:' : 'Roots:'} <strong>{lang === 'bn' ? crop.rootingDepthBn : crop.rootingDepth}</strong></span>
                              </div>
                            </div>
                          </div>

                          <select
                            value={cropId}
                            onChange={(e) => {
                              const next = [...recommendedPlan];
                              next[idx] = e.target.value;
                              setRecommendedPlan(next);
                            }}
                            className="text-xs rounded-xl px-2 py-1 border outline-none cursor-pointer glass-subtle border-sky-500/15 text-slate-800 dark:text-slate-100"
                          >
                            {Object.values(CROP_DATABASE).map(c => (
                              <option key={c.id} value={c.id}>{lang === 'bn' ? c.nameBn : c.name}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`${bgSubCard} p-4 rounded-2xl text-xs space-y-1.5`}>
                    <div className="font-bold flex items-center gap-1.5 text-sky-600 dark:text-sky-300">
                      <Info className="h-4 w-4" />
                      <span>{lang === 'bn' ? 'কেন এই ফসল বিন্যাস বিজ্ঞানসম্মত?' : 'Why is this sequence recommended?'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {lang === 'bn'
                        ? `১. সরিষা চাষে পোকা-মাকড়ের জীবনচক্র ভেঙে যায়। ২. ছোলা ও মুগডাল মাটির গভীরে শিকড় পাঠিয়ে পানি ধরে রাখে এবং জমিতে প্রাকৃতিক সার যোগ করে। ৩. বোরো ধানের অতিরিক্ত সেচ এড়িয়ে বছরে মোট ${tradMetrics.totalWaterMm - recMetrics.totalWaterMm} মিমি পানি সাশ্রয় হয়।`
                        : `1. Brassica (mustard) interrupts soil fungal pathogen cycles. 2. Legumes fix atmospheric nitrogen, replenishing depleted soil. 3. Reduces annual groundwater pumping by ${tradMetrics.totalWaterMm - recMetrics.totalWaterMm}mm.`}
                    </p>
                  </div>
                </div>

                {/* TRADITIONAL MONOCULTURE BASELINE */}
                <div className={`${bgCard} p-5 rounded-4xl shadow-xl space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                        <AlertTriangle className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className={`font-extrabold text-sm lg:text-base ${textTitle}`}>
                          {lang === 'bn' ? 'কৃষকের প্রচলিত প্রথা (ধান-ধান মনোকালচার)' : 'Current Practice (Monoculture)'}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {lang === 'bn' ? 'অতিরিক্ত পানি অপচয় ও মাটির উর্বরতা ক্ষয়' : 'Heavy groundwater exploitation & soil degradation'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      {lang === 'bn' ? 'উচ্চ ঝুঁকি' : 'High Risk'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {traditionalPlan.map((cropId, idx) => {
                      const crop = CROP_DATABASE[cropId];
                      return (
                        <div key={idx} className={`${bgSubCard} p-3.5 rounded-2xl flex items-center justify-between gap-3`}>
                          <div className="flex items-center gap-3">
                            <span className="h-7 w-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 bg-slate-400/30 text-slate-700 dark:text-slate-200">
                              {`S${idx + 1}`}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-bold text-xs lg:text-sm ${textTitle}`}>
                                  {lang === 'bn' ? crop.nameBn : crop.name}
                                </h4>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-400/20 text-slate-700 dark:text-slate-200">
                                  {lang === 'bn' ? crop.categoryBn : crop.category}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-[11px] mt-1 text-slate-600 dark:text-slate-400">
                                <span>{lang === 'bn' ? 'পানি:' : 'Water:'} <strong className="text-amber-500">{crop.waterMm}mm</strong></span>
                                <span>{lang === 'bn' ? 'নাইট্রোজেন:' : 'N-Loss:'} <strong className="text-red-500">{crop.nBalanceKgHa} kg</strong></span>
                              </div>
                            </div>
                          </div>

                          <select
                            value={cropId}
                            onChange={(e) => {
                              const next = [...traditionalPlan];
                              next[idx] = e.target.value;
                              setTraditionalPlan(next);
                            }}
                            className="text-xs rounded-xl px-2 py-1 border outline-none cursor-pointer glass-subtle border-sky-500/15 text-slate-800 dark:text-slate-100"
                          >
                            {Object.values(CROP_DATABASE).map(c => (
                              <option key={c.id} value={c.id}>{lang === 'bn' ? c.nameBn : c.name}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`${bgSubCard} p-4 rounded-2xl text-xs space-y-1.5 border border-amber-500/20`}>
                    <div className="font-bold flex items-center gap-1.5 text-amber-500">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{lang === 'bn' ? 'প্রচলিত চাষাবাদের ক্ষতিকর প্রভাব:' : 'Vulnerability Assessment:'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {lang === 'bn'
                        ? `ক্রমাগত ধান চাষে মাটির নিচে শক্ত স্তর তৈরি হয়, যা শিকড় চলাচলে বাধা দেয়। ভূগর্ভস্থ পানির স্তর নিচে নামায় গভীর নলকূপের বিদ্যুত খরচ দ্বিগুণ হয়।`
                        : `Continuous paddy cultivation creates a dense plow pan, restricts subsoil aeration, and accelerates seasonal water table collapse.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* ======================================================== */}
          {/* TAB 2: WHAT-IF CLIMATE SIMULATOR                        */}
          {/* ======================================================== */}
          {activeTab === 'whatif' && (
            <div className="space-y-6 card-rise">
              <div className={`${bgCard} p-6 rounded-4xl space-y-6 shadow-xl`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sky-500/15 gap-4`}>
                  <div>
                    <h3 className={`text-lg font-black flex items-center gap-2 ${textTitle}`}>
                      <Sliders className="h-5 w-5 text-sky-500" />
                      <span>{lang === 'bn' ? 'হোয়াট-ইফ জলবায়ু সিমুলেটর' : 'What-If Climate Simulator'}</span>
                    </h3>
                    <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">
                      {lang === 'bn'
                        ? 'বৃষ্টিপাত কমলে বা তাপমাত্রা বাড়লে আপনার ফসল টিকবে কিনা তা আগেই পরীক্ষা করে দেখুন।'
                        : 'Simulate climate shocks (drought, heatwaves, water rationing) and test crop survival.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSimRainfallDelta(-25);
                      setSimTempDelta(1.5);
                      setSimIrrigationConstraint(35);
                    }}
                    className="btn-popup px-3 py-1.5 rounded-xl border border-sky-500/15 glass-subtle text-xs font-bold flex items-center gap-1.5 w-fit text-sky-600 dark:text-sky-300"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{lang === 'bn' ? 'রিসেট করুন' : 'Reset Sliders'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 1. Rainfall */}
                  <div className={`${bgSubCard} p-4 rounded-2xl space-y-2`}>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="h-4 w-4 text-cyan-500" />
                        {lang === 'bn' ? 'বৃষ্টিপাত পরিবর্তন' : 'Rainfall Shift'}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono ${simRainfallDelta < 0 ? 'bg-red-500/15 text-red-500' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'}`}>
                        {simRainfallDelta > 0 ? `+${simRainfallDelta}%` : `${simRainfallDelta}%`}
                      </span>
                    </div>
                    <input
                      type="range" min="-40" max="40" step="5"
                      value={simRainfallDelta}
                      onChange={(e) => setSimRainfallDelta(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                      <span>{lang === 'bn' ? '-৪০% (তীব্র খরা)' : '-40% (Drought)'}</span>
                      <span>0%</span>
                      <span>{lang === 'bn' ? '+৪০% (অতিবৃষ্টি)' : '+40% (Flood)'}</span>
                    </div>
                  </div>

                  {/* 2. Temperature */}
                  <div className={`${bgSubCard} p-4 rounded-2xl space-y-2`}>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sun className="h-4 w-4 text-amber-500" />
                        {lang === 'bn' ? 'তাপমাত্রা বৃদ্ধি' : 'Temp Increase'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 font-mono">
                        +{simTempDelta}°C
                      </span>
                    </div>
                    <input
                      type="range" min="0" max="4.0" step="0.5"
                      value={simTempDelta}
                      onChange={(e) => setSimTempDelta(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                      <span>0°C</span>
                      <span>+2°C</span>
                      <span>+4°C</span>
                    </div>
                  </div>

                  {/* 3. Irrigation Constraint */}
                  <div className={`${bgSubCard} p-4 rounded-2xl space-y-2`}>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-sky-500" />
                        {lang === 'bn' ? 'সেচ সীমাবদ্ধতা' : 'Irrigation Constraint'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-300 font-mono">
                        -{simIrrigationConstraint}%
                      </span>
                    </div>
                    <input
                      type="range" min="0" max="80" step="5"
                      value={simIrrigationConstraint}
                      onChange={(e) => setSimIrrigationConstraint(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                      <span>0%</span>
                      <span>-40%</span>
                      <span>-80%</span>
                    </div>
                  </div>
                </div>

                {/* Output comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`${bgSubCard} p-5 rounded-2xl space-y-3`}>
                    <h4 className="text-xs font-black flex items-center gap-2 text-sky-600 dark:text-sky-300">
                      <Sparkles className="h-4 w-4" />
                      {lang === 'bn' ? 'নাসা-স্মার্ট পরিকল্পনা সিমুলেশন' : 'Recommended Plan (Simulated)'}
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'মাটির স্কোর' : 'Soil Score'}</span><strong className={textTitle}>{simRecMetrics.soilScore}/100</strong></div>
                      <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'পানি চাপ' : 'Water Stress'}</span><strong className={simRecMetrics.waterStress > 60 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-300'}>{simRecMetrics.waterStress}/100</strong></div>
                      <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'ফলন সহনশীলতা' : 'Yield Resilience'}</span><strong className="text-sky-600 dark:text-sky-300">{simRecMetrics.yieldResilience}%</strong></div>
                    </div>
                  </div>

                  <div className={`${bgSubCard} p-5 rounded-2xl space-y-3`}>
                    <h4 className="text-xs font-black flex items-center gap-2 text-amber-500">
                      <AlertTriangle className="h-4 w-4" />
                      {lang === 'bn' ? 'প্রচলিত পরিকল্পনা সিমুলেশন' : 'Traditional Plan (Simulated)'}
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'মাটির স্কোর' : 'Soil Score'}</span><strong className={textTitle}>{simTradMetrics.soilScore}/100</strong></div>
                      <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'পানি চাপ' : 'Water Stress'}</span><strong className="text-red-500">{simTradMetrics.waterStress}/100</strong></div>
                      <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'ফলন সহনশীলতা' : 'Yield Resilience'}</span><strong className="text-amber-500">{simTradMetrics.yieldResilience}%</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: SOIL & WATER ANALYTICS                            */}
          {/* ======================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 card-rise">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${bgCard} p-6 rounded-4xl space-y-4 shadow-xl`}>
                  <h3 className={`font-black text-base ${textTitle} flex items-center gap-2`}>
                    <BarChart3 className="h-5 w-5 text-indigo-500" />
                    <span>{lang === 'bn' ? 'ফসলের সার্বিক সক্ষমতা ও লাভজনকতা' : 'Comprehensive Rotation Performance'}</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {lang === 'bn' ? 'নাসার স্যাটেলাইট উপাত্তের ওপর ভিত্তি করে ৬টি মানদণ্ডে বিশ্লেষণ' : 'Evaluated across 6 agro-ecological & economic metrics'}
                  </p>

                  <div className="space-y-3.5 pt-2">
                    {[
                      { labelBn: 'পানির সাশ্রয়', labelEn: 'Water Conservation', ad: 88, tr: 30 },
                      { labelBn: 'মাটির জৈব পদার্থ বৃদ্ধি', labelEn: 'Organic Matter (SOM)', ad: 84, tr: 26 },
                      { labelBn: 'প্রাকৃতিক নাইট্রোজেন যোগ', labelEn: 'Nitrogen Balance', ad: 92, tr: 22 },
                      { labelBn: 'খরা ও তাপদাহ টিকে থাকা', labelEn: 'Drought Survival', ad: 86, tr: 34 },
                      { labelBn: 'পোকা-মাকড় দমন চক্র', labelEn: 'Pest Break Cycle', ad: 94, tr: 38 },
                      { labelBn: 'কৃষকের নীট আর্থিক লাভ', labelEn: 'Farmer Net Profit', ad: 80, tr: 60 }
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{lang === 'bn' ? item.labelBn : item.labelEn}</span>
                          <span className="text-[11px]">
                            <strong className="text-sky-600 dark:text-sky-300">{item.ad}%</strong> vs <span className="text-slate-400">{item.tr}%</span>
                          </span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden flex bg-slate-400/15">
                          <div style={{ width: `${item.ad}%` }} className="h-full rounded-full bg-sky-500"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3-Year Soil Organic Matter Forecast */}
                <div className={`${bgCard} p-6 rounded-4xl space-y-4 shadow-xl flex flex-col justify-between`}>
                  <div>
                    <h3 className={`font-black text-base ${textTitle} flex items-center gap-2`}>
                      <Layers className="h-5 w-5 text-sky-500" />
                      <span>{lang === 'bn' ? '৩ বছরে মাটির জৈব পদার্থের (SOM) পরিবর্তন' : '3-Year Soil Organic Matter Projection'}</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {lang === 'bn'
                        ? 'ডাল জাতীয় ফসল ও সবুজ সার ব্যবহারের ফলে মাটির কার্বন বৃদ্ধি'
                        : 'Soil organic carbon enhancement modeled via legume biomass residue'}
                    </p>

                    <div className="grid grid-cols-3 gap-3 my-6">
                      <div className={`${bgSubCard} p-3.5 rounded-2xl text-center`}>
                        <span className="text-[11px] block text-slate-600 dark:text-slate-400">{lang === 'bn' ? '১ম বছর' : 'Year 1'}</span>
                        <span className={`text-xl font-black ${textTitle}`}>1.35%</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-300 block font-bold">+0.15% SOM</span>
                      </div>
                      <div className={`${bgSubCard} p-3.5 rounded-2xl text-center`}>
                        <span className="text-[11px] block text-slate-600 dark:text-slate-400">{lang === 'bn' ? '২য় বছর' : 'Year 2'}</span>
                        <span className={`text-xl font-black ${textTitle}`}>1.68%</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-300 block font-bold">+0.48% SOM</span>
                      </div>
                      <div className={`${bgSubCard} p-3.5 rounded-2xl text-center`}>
                        <span className="text-[11px] block text-slate-600 dark:text-slate-400">{lang === 'bn' ? '৩য় বছর' : 'Year 3'}</span>
                        <span className="text-xl font-black text-sky-600 dark:text-sky-300">2.10%</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-300 block font-bold">+0.90% SOM</span>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed p-3.5 rounded-2xl border ${bgSubCard} border-sky-500/15`}>
                      {lang === 'bn'
                        ? `${selectedDistrict.nameBn} জেলার মাটিতে বর্তমানে জৈব পদার্থ ${soilOrganicMatter}%। এই পর্যায়ক্রম মানলে ৩ বছরে তা ২.১০% এ উন্নীত হবে এবং সেচের পানি ধরে রাখার ক্ষমতা ৩৫% বৃদ্ধি পাবে।`
                        : `Initial soil organic matter is ${soilOrganicMatter}%. With adaptive legume rotations, organic carbon rises to 2.10%, increasing water infiltration by 35%.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: NASA EARTH TELEMETRY                              */}
          {/* ======================================================== */}
          {activeTab === 'nasa' && (
            <div className="space-y-6 card-rise">
              <div className={`${bgCard} p-6 rounded-4xl space-y-6 shadow-xl`}>
                <h3 className={`text-lg font-black flex items-center gap-2 ${textTitle}`}>
                  <Globe className="h-5 w-5 text-sky-500" />
                  <span>{lang === 'bn' ? 'নাসা আর্থ পর্যবেক্ষণ ও স্যাটেলাইট' : 'NASA Earth Telemetry'}</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {lang === 'bn' ? 'POWER, SMAP, MODIS এবং ECOSTRESS স্যাটেলাইট থেকে প্রাপ্ত তথ্য।' : 'Live feeds from POWER, SMAP, MODIS and ECOSTRESS satellites.'}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`${bgSubCard} p-4 rounded-2xl`}>
                    <div className="flex items-center justify-between text-xs mb-1 text-slate-600 dark:text-slate-400">
                      <span>NASA POWER</span>
                      <Sun className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className={`text-xl font-black ${textTitle}`}>{selectedDistrict.rainfall} mm</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'বার্ষিক গড় বৃষ্টিপাত' : 'Mean Annual Rainfall'}</div>
                  </div>

                  <div className={`${bgSubCard} p-4 rounded-2xl`}>
                    <div className="flex items-center justify-between text-xs mb-1 text-slate-600 dark:text-slate-400">
                      <span>NASA SMAP</span>
                      <Droplets className="h-4 w-4 text-cyan-500" />
                    </div>
                    <div className="text-xl font-black text-cyan-600 dark:text-cyan-300">0.18 m³/m³</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'মাটির আর্দ্রতা (শিকড় স্তর)' : 'Root-Zone Moisture'}</div>
                  </div>

                  <div className={`${bgSubCard} p-4 rounded-2xl`}>
                    <div className="flex items-center justify-between text-xs mb-1 text-slate-600 dark:text-slate-400">
                      <span>MODIS / Landsat</span>
                      <Sprout className="h-4 w-4 text-sky-500" />
                    </div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-300">0.56 NDVI</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'সবুজের ঘনত্ব সূচক' : 'Vegetation Canopy Health'}</div>
                  </div>

                  <div className={`${bgSubCard} p-4 rounded-2xl`}>
                    <div className="flex items-center justify-between text-xs mb-1 text-slate-600 dark:text-slate-400">
                      <span>ECOSTRESS</span>
                      <Flame className="h-4 w-4 text-red-500" />
                    </div>
                    <div className={`text-xl font-black ${textTitle}`}>4.1 mm/day</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">{lang === 'bn' ? 'বাষ্পীভবন ও পানির টান' : 'Evapotranspiration'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: FARM & SOIL LAB PROFILE                          */}
          {/* ======================================================== */}
          {activeTab === 'farm_profile' && (
            <div className="space-y-6 card-rise">
              <div className={`${bgCard} p-6 rounded-4xl space-y-6 shadow-xl`}>
                <h3 className={`text-lg font-black flex items-center gap-2 ${textTitle}`}>
                  <Layers className="h-5 w-5 text-sky-500" />
                  <span>{lang === 'bn' ? 'খামার ও মাটির ল্যাব টেস্ট তথ্য' : 'Farm Profile & Soil Lab Parameters'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-bold block mb-1 text-slate-600 dark:text-slate-300">
                      {lang === 'bn' ? 'মোট আবাদি জমি (বিঘা):' : 'Cultivated Area (Bigha):'}
                    </label>
                    <input
                      type="number"
                      value={farmSizeBigha}
                      onChange={(e) => setFarmSizeBigha(Number(e.target.value))}
                      className="w-full text-sm font-bold p-2.5 rounded-xl glass-subtle border border-sky-500/15 text-slate-800 dark:text-slate-100"
                    />
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">~{(farmSizeBigha * 0.33).toFixed(1)} {lang === 'bn' ? 'একর' : 'Acres'}</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1 text-slate-600 dark:text-slate-300">
                      {lang === 'bn' ? 'মাটির ধরণ:' : 'Soil Texture:'}
                    </label>
                    <input
                      type="text"
                      value={selectedDistrict.soil}
                      readOnly
                      className="w-full text-xs font-bold p-2.5 rounded-xl glass-subtle border border-sky-500/15 text-sky-600 dark:text-sky-300"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1 text-slate-600 dark:text-slate-300">
                      {lang === 'bn' ? 'সেচ ব্যবস্থা:' : 'Irrigation Infrastructure:'}
                    </label>
                    <select
                      value={irrigationType}
                      onChange={(e) => setIrrigationType(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 rounded-xl glass-subtle border border-sky-500/15 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Deep Tube Well">{lang === 'bn' ? 'গভীর নলকূপ' : 'Deep Tube Well'}</option>
                      <option value="Shallow Tube Well">{lang === 'bn' ? 'অগভীর নলকূপ' : 'Shallow Tube Well'}</option>
                      <option value="Canal/Surface">{lang === 'bn' ? 'খাল বা নদীর পানি' : 'Canal/River'}</option>
                      <option value="Rainfed">{lang === 'bn' ? 'বৃষ্টি নির্ভর' : 'Rainfed'}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: ADMIN CONTROL & BROADCAST                          */}
          {/* ======================================================== */}
          {activeTab === 'admin' && user.role === 'admin' && (
            <div className="space-y-6 card-rise">
              <div className={`${bgCard} p-6 rounded-4xl space-y-6 shadow-xl`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sky-500/15 gap-4`}>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/25">
                      {lang === 'bn' ? 'অ্যাডমিন কন্ট্রোল প্যানেল' : 'Admin Control Panel'}
                    </span>
                    <h3 className={`text-xl font-black ${textTitle} mt-1 flex items-center gap-2`}>
                      <Radio className="h-6 w-6 text-violet-500" />
                      <span>{lang === 'bn' ? 'বিভাগীয় খরা ও জলবায়ু জরুরি সতর্কতা সম্প্রচার' : 'Regional Climate Emergency Broadcast'}</span>
                    </h3>
                    <p className="text-xs mt-0.5 text-slate-600 dark:text-slate-300">
                      Lead Administrator: <strong className="text-violet-600 dark:text-violet-300">{user.name}</strong>
                    </p>
                  </div>
                  <div className="text-xs font-mono px-3 py-1.5 rounded-xl border border-sky-500/15 glass-subtle text-sky-600 dark:text-sky-300">
                    {lang === 'bn' ? 'নিবন্ধিত কৃষক: ১৪,২৮০ জন' : 'Registered Farmers: 14,280'}
                  </div>
                </div>

                <div className={`${bgSubCard} p-5 rounded-2xl space-y-4`}>
                  <h4 className="font-bold text-sm flex items-center gap-2 text-violet-600 dark:text-violet-300">
                    <BellRing className="h-4 w-4 text-violet-500" />
                    <span>{lang === 'bn' ? 'কৃষকদের মোবাইলে জরুরি সতর্কতা পাঠান' : 'Broadcast Advisory to Farmers'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1 text-slate-600 dark:text-slate-300">
                        {lang === 'bn' ? 'লক্ষ্য বিভাগ নির্বাচন:' : 'Target Division:'}
                      </label>
                      <select
                        value={adminDivision}
                        onChange={(e) => setAdminDivision(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 rounded-xl glass-subtle border border-sky-500/15 text-slate-800 dark:text-slate-100"
                      >
                        {['Rajshahi', 'Rangpur', 'Khulna', 'Chittagong', 'Barishal', 'Dhaka', 'Sylhet', 'Mymensingh'].map(d => (
                          <option key={d} value={d}>{d} {lang === 'bn' ? 'বিভাগ' : 'Division'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1 text-slate-600 dark:text-slate-300">
                        {lang === 'bn' ? 'সতর্কতার ধরণ:' : 'Warning Type:'}
                      </label>
                      <select
                        value={adminWarningType}
                        onChange={(e) => setAdminWarningType(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 rounded-xl glass-subtle border border-sky-500/15 text-slate-800 dark:text-slate-100"
                      >
                        <option value="খরা ও ভূগর্ভস্থ পানি সতর্কতা">{lang === 'bn' ? 'খরা ও ভূগর্ভস্থ পানি সংকট' : 'Drought & Moisture Deficit'}</option>
                        <option value="লবণাক্ততা বৃদ্ধি সতর্কতা">{lang === 'bn' ? 'লবণাক্ততা বৃদ্ধি' : 'Soil Salinity Surge'}</option>
                        <option value="আগাম পাহাড়ি ঢল ও বন্যা">{lang === 'bn' ? 'আগাম পাহাড়ি ঢল ও হাওর বন্যা' : 'Early Flash Flood'}</option>
                        <option value="তীব্র শৈত্যপ্রবাহ ও কুয়াশা">{lang === 'bn' ? 'তীব্র শৈত্যপ্রবাহ ও কুয়াশা' : 'Cold Wave Advisory'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold block text-slate-600 dark:text-slate-300">
                      {lang === 'bn' ? 'কৃষকদের জন্য স্বয়ংক্রিয় বার্তা:' : 'Generated Message Payload:'}
                    </label>
                    <textarea
                      rows={3}
                      readOnly
                      value={`[Emergency Alert from ${user.name}]: ${adminDivision} division — ${adminWarningType}. Avoid excess boro irrigation; switch to pulses and mustard.`}
                      className="w-full text-xs font-mono p-3 rounded-xl glass-subtle border border-sky-500/15 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setAlertBroadcastSent(true);
                      setTimeout(() => setAlertBroadcastSent(false), 4000);
                    }}
                    className="btn-popup flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                    <span>{lang === 'bn' ? '১৪,২৮০ জন কৃষকের মোবাইলে ব্রডকাস্ট করুন' : 'Dispatch Broadcast to 14,280 Farmers'}</span>
                  </button>

                  {alertBroadcastSent && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 card-popup">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{lang === 'bn' ? 'সতর্কতা বার্তা সফলভাবে প্রেরণ করা হয়েছে!' : 'Alert broadcast successfully dispatched!'}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`${bgSubCard} p-4 rounded-xl`}>
                    <div className="text-xs text-slate-600 dark:text-slate-400">NASA POWER API Status</div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-300 mt-1">99.8% Online (32ms)</div>
                    <div className="text-[11px] mt-0.5 text-slate-600 dark:text-slate-400">Precipitation & Radiation Engine</div>
                  </div>
                  <div className={`${bgSubCard} p-4 rounded-xl`}>
                    <div className="text-xs text-slate-600 dark:text-slate-400">NASA SMAP 9km Grid</div>
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-300 mt-1">Calibrated (6h ago)</div>
                    <div className="text-[11px] mt-0.5 text-slate-600 dark:text-slate-400">L-Band Soil Moisture Telemetry</div>
                  </div>
                  <div className={`${bgSubCard} p-4 rounded-xl`}>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Lead System Admin</div>
                    <div className={`text-lg font-bold mt-1 ${textTitle}`}>{user.name}</div>
                    <div className="text-[11px] mt-0.5 text-slate-600 dark:text-slate-400">Agricultural System Architect</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: FARM ACTION REPORT                              */}
          {/* ======================================================== */}
          {activeTab === 'report' && (
            <div className="space-y-6 card-rise">
              <div className={`${bgCard} p-6 lg:p-8 rounded-4xl space-y-6 shadow-2xl`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sky-500/15 gap-4`}>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25">
                      {lang === 'bn' ? 'কৃষক পরামর্শ ও কর্মপরিকল্পনা দলিল' : 'Official Farmer Decision Dossier'}
                    </span>
                    <h3 className={`text-xl font-black ${textTitle} mt-1`}>
                      {lang === 'bn' ? `${selectedDistrict.nameBn} জেলার জন্য ফসল পর্যায়ক্রম কর্মপরিকল্পনা` : `Farm Adaptation Plan for ${selectedDistrict.name} District`}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {lang === 'bn' ? `কৃষক: ${user.name} (${user.phone}) • ডেভেলপড বাই SPIDERX` : `Farmer: ${user.name} (${user.phone}) • Developed by SPIDERX`}
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className={`btn-popup flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs w-fit ${primaryBtn}`}
                  >
                    <Download className="h-4 w-4" />
                    <span>{lang === 'bn' ? 'প্রিন্ট বা পিডিএফ ডাউনলোড' : 'Print / Download PDF'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-sky-600 dark:text-sky-300">
                    {lang === 'bn' ? '৪-মৌসুমের বিস্তারিত ফসল রোপণ ও পরিচর্যা সূচি:' : 'Recommended 4-Season Implementation Schedule:'}
                  </h4>
                  {recommendedPlan.map((cropId, idx) => {
                    const c = CROP_DATABASE[cropId];
                    return (
                      <div key={idx} className={`${bgSubCard} p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                        <div className="flex items-center gap-3">
                          <span className="h-8 w-8 rounded-xl font-black text-sm flex items-center justify-center bg-sky-600 text-white">
                            {idx + 1}
                          </span>
                          <div>
                            <div className={`font-bold text-sm ${textTitle}`}>
                              {lang === 'bn' ? c.nameBn : c.name} ({c.family})
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              {lang === 'bn' ? `জীবনকাল: ~${c.growingPeriodDays} দিন • শিকড়: ${c.rootingDepthBn}` : `Duration: ~${c.growingPeriodDays} days • Roots: ${c.rootingDepth}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <span className={`font-bold ${c.nBalanceKgHa > 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-500'}`}>
                            {c.nBalanceKgHa > 0 ? `+${c.nBalanceKgHa} kg/ha` : `${c.nBalanceKgHa} kg/ha`}
                          </span>
                          <span className="block text-[11px] text-cyan-600 dark:text-cyan-300">{c.waterMm} mm</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </main>

        {/* FOOTER */}
        <footer className="glass-subtle border-t border-sky-500/10 py-6 px-4 lg:px-8 mt-auto text-center text-xs text-slate-600 dark:text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Field Shift</span> • {lang === 'bn' ? 'ডেভেলপড বাই SPIDERX' : 'Developed by SPIDERX'}
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>NASA POWER</span>
              <span>NASA SMAP</span>
              <span>NASA ECOSTRESS</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
