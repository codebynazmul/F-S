'use client';

import React, { useState, useMemo } from 'react';
import {
  Satellite,
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
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  
  // Theme state: 'day' = Green Hunter + White, 'night' = Full Black
  const [theme, setTheme] = useState<'day' | 'night'>('day');

  // Mobile sidebar drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // User Authentication State: null by default (shows clean white Login page)
  const [user, setUser] = useState<{
    name: string;
    email: string;
    phone: string;
    photo: string;
    role: 'farmer' | 'admin';
  } | null>(null);

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<'rotation' | 'whatif' | 'analytics' | 'nasa' | 'farm_profile' | 'user_account' | 'admin' | 'report'>('rotation');

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
  const [editPhoto, setEditPhoto] = useState<string>('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<boolean>(false);

  // What-If Simulation Sliders
  const [simRainfallDelta, setSimRainfallDelta] = useState<number>(-25);
  const [simTempDelta, setSimTempDelta] = useState<number>(1.5);
  const [simIrrigationConstraint, setSimIrrigationConstraint] = useState<number>(35);

  // Crop Rotation Plans
  const [traditionalPlan, setTraditionalPlan] = useState<string[]>([
    'rice_boro',
    'rice_aman',
    'rice_boro',
    'rice_aman'
  ]);

  const [recommendedPlan, setRecommendedPlan] = useState<string[]>([
    'mustard',
    'chickpea',
    'rice_aman',
    'mungbean'
  ]);

  // Admin Broadcast Alert State
  const [alertBroadcastSent, setAlertBroadcastSent] = useState<boolean>(false);
  const [adminDivision, setAdminDivision] = useState<string>('Rajshahi');
  const [adminWarningType, setAdminWarningType] = useState<string>('খরা ও ভূগর্ভস্থ পানি সতর্কতা');

  const handleLogin = (role: 'farmer' | 'admin') => {
    if (role === 'farmer') {
      const u = {
        name: 'MR. RAJU',
        email: 'raju.farmer@gmail.com',
        phone: '+880 1712-345678',
        photo: '👨‍🌾',
        role: 'farmer' as const
      };
      setUser(u);
      setEditName(u.name);
      setEditPhone(u.phone);
      setEditPhoto(u.photo);
      setActiveTab('rotation');
    } else {
      const u = {
        name: 'MD. NAZMUL HASAN',
        email: 'nazmul.hasan@nasa.spaceapps.bd',
        phone: '+880 1912-987654',
        photo: '👨‍💻',
        role: 'admin' as const
      };
      setUser(u);
      setEditName(u.name);
      setEditPhone(u.phone);
      setEditPhoto(u.photo);
      setActiveTab('admin');
    }
  };

  const handleSaveProfile = () => {
    if (!user) return;
    setUser({
      ...user,
      name: editName || user.name,
      phone: editPhone || user.phone,
      photo: editPhoto || user.photo
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

  // THEME DEFINITIONS:
  // DAY MODE: Green Hunter (#1B4332, #0B2519) + White (#FFFFFF)
  // NIGHT MODE: Full Black (#000000, #0A0A0A)
  const isNight = theme === 'night';

  const bgMain = isNight ? 'bg-black text-slate-100' : 'bg-white text-slate-900';
  const bgSidebar = isNight ? 'bg-black border-[#1C1C1C]' : 'bg-[#0B2519] text-white border-[#1B4332]';
  const bgTopHeader = isNight ? 'bg-black/95 border-[#1C1C1C]' : 'bg-white/95 border-emerald-100';
  const bgDistrictBar = isNight ? 'bg-[#080808] border-[#1C1C1C]' : 'bg-[#EBF5EE] border-emerald-100 text-[#0B2519]';
  const bgCard = isNight ? 'bg-[#0A0A0A] border-[#1F1F1F] shadow-xl text-slate-100' : 'bg-white border-emerald-200/80 shadow-md text-slate-900';
  const bgSubCard = isNight ? 'bg-[#121212] border-[#242424] text-slate-200' : 'bg-[#F2F9F4] border-emerald-100 text-slate-800';
  const textTitle = isNight ? 'text-white' : 'text-[#0B2519]';
  const borderDefault = isNight ? 'border-[#1F1F1F]' : 'border-emerald-200';
  const primaryBtn = isNight ? 'bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold' : 'bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold shadow-md';

  // Navigation Items Definition for the Left Menu Bar
  const navMenuItems = [
    { id: 'rotation', labelBn: '১. ফসল পর্যায়ক্রম অপটিমাইজার', labelEn: '1. Crop Rotation Optimizer', icon: Sprout },
    { id: 'whatif', labelBn: '২. জলবায়ু সিমুলেটর (হোয়াট-ইফ)', labelEn: '2. What-If Climate Simulator', icon: Sliders },
    { id: 'analytics', labelBn: '৩. মাটি ও পানির তুলনা', labelEn: '3. Soil & Water Analytics', icon: BarChart3 },
    { id: 'nasa', labelBn: '৪. নাসা আর্থ পর্যবেক্ষণ ও স্যাটেলাইট', labelEn: '4. NASA Earth Telemetry', icon: Globe },
    { id: 'farm_profile', labelBn: '৫. খামার ও মাটির ল্যাব তথ্য', labelEn: '5. Farm & Soil Profile', icon: Layers },
    { id: 'user_account', labelBn: '👤 আমার একাউন্ট ও প্রোফাইল', labelEn: '👤 My Account Dashboard', icon: User },
    ...(user?.role === 'admin' ? [{ id: 'admin', labelBn: '🏛️ এডমিন কন্ট্রোল ও সতর্কতা বোর্ড', labelEn: '🏛️ Admin Control & Broadcast', icon: Radio }] : []),
    { id: 'report', labelBn: '৬. কৃষক কর্মপরিকল্পনা রিপোর্ট', labelEn: '6. Farm Action Dossier', icon: FileText }
  ];

  // =========================================================================
  // VIEW 1: DEDICATED CLEAN WHITE LOGIN & REGISTRATION PAGE (INITIAL SCREEN)
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans antialiased">
        <header className="border-b border-emerald-100 bg-white/90 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center shadow-md shadow-[#1B4332]/20">
              <Satellite className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#1B4332] border border-emerald-200 uppercase tracking-wider">
                NASA Space Apps Challenge 2026
              </span>
              <h1 className="text-base lg:text-lg font-black tracking-tight text-[#0B2519]">
                {lang === 'bn' ? 'ফিল্ড শিফট' : 'Field Shift'} <span className="text-[#1B4332] font-medium">| {lang === 'bn' ? 'নাসার তথ্যে কৃষির জলবায়ু অভিযোজন' : 'Adapting Farms with NASA Data'}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <button
                onClick={() => setLang('bn')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'bn' ? 'bg-[#1B4332] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'en' ? 'bg-[#1B4332] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 lg:p-12 bg-gradient-to-b from-white via-[#F7FAF8] to-[#EAF4ED]">
          <div className="max-w-md w-full bg-white border border-emerald-200/90 rounded-3xl p-8 lg:p-10 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="h-16 w-16 rounded-3xl bg-[#1B4332] text-white flex items-center justify-center mx-auto shadow-xl shadow-[#1B4332]/25">
                <Sprout className="h-8 w-8 text-emerald-300" />
              </div>
              <h2 className="text-2xl font-black text-[#0B2519] tracking-tight pt-2">
                {lang === 'bn' ? 'কৃষক ও এডমিন লগইন' : 'Farmer & Admin Login'}
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {lang === 'bn'
                  ? 'নাসার স্যাটেলাইট আর্থ অবজারভেশন ডাটা ও স্মার্ট ফসল পর্যায়ক্রমে প্রবেশ করতে গুগল দিয়ে সাইন ইন করুন।'
                  : 'Tap on Google to access NASA satellite observations and adaptive crop rotation planning.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleLogin('farmer')}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl border-2 border-emerald-200 hover:border-[#1B4332] bg-white hover:bg-emerald-50/50 text-slate-800 font-bold text-sm shadow-sm transition-all group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[#0B2519] group-hover:text-[#1B4332] transition-colors">
                    {lang === 'bn' ? 'গুগল দিয়ে কৃষক হিসেবে প্রবেশ (মি. রাজু)' : 'Sign in with Google (MR. RAJU - Farmer)'}
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">raju.farmer@gmail.com</span>
                </div>
              </button>

              <button
                onClick={() => handleLogin('admin')}
                className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-[#0B2519] hover:bg-[#1B4332] text-white font-bold text-xs shadow-md transition-all"
              >
                <Radio className="h-4 w-4 text-emerald-400" />
                <div className="text-left leading-tight">
                  <span className="block">
                    {lang === 'bn' ? 'এডমিন পোর্টাল প্রবেশ (মো. নাজমুল হাসান)' : 'Login as Admin (MD. NAZMUL HASAN)'}
                  </span>
                  <span className="text-[10px] text-emerald-200 font-normal">nazmul.hasan@nasa.spaceapps.bd</span>
                </div>
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-emerald-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                {lang === 'bn' ? 'অথবা মোবাইল ও ওটিপি' : 'Or Mobile / OTP'}
              </span>
              <div className="flex-grow border-t border-emerald-100"></div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  {lang === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile Number:'}
                </label>
                <div className="flex items-center gap-2 border border-emerald-200 rounded-xl px-3 py-2 bg-slate-50 text-xs">
                  <span className="font-bold text-slate-500">+880</span>
                  <input
                    type="text"
                    defaultValue="1712-345678"
                    placeholder="1XXXXXXXXX"
                    className="w-full bg-transparent outline-none font-bold text-slate-800"
                  />
                </div>
              </div>

              <button
                onClick={() => handleLogin('farmer')}
                className="w-full py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs shadow-lg shadow-[#1B4332]/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{lang === 'bn' ? 'ওটিপি যাচাই করে প্রবেশ করুন' : 'Verify & Continue'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1">
              <p>🛰️ NASA Earth Science Division • Bangladesh Agricultural Portal</p>
              <p>{lang === 'bn' ? 'বিনামূল্যে ও সুরক্ষিত ওপেন সোর্স প্ল্যাটফর্ম' : 'Open Source Public Decision Support Tool'}</p>
            </div>

          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: MAIN APPLICATION WITH LEFT SIDEBAR (GREEN HUNTER OR FULL BLACK)
  // =========================================================================
  return (
    <div className={`min-h-screen ${bgMain} flex font-sans transition-colors duration-200 antialiased`}>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in"
        ></div>
      )}

      {/* ===================================================================== */}
      {/* --- LEFT-SIDE MENU BAR (STICKY DESKTOP & SLIDE-OVER MOBILE) ---      */}
      {/* ===================================================================== */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 w-72 lg:w-80 shrink-0 h-screen border-r ${bgSidebar} flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top of Sidebar: Brand & User Identity Card */}
        <div className={`p-5 border-b ${isNight ? 'border-[#1F1F1F]' : 'border-[#16442F]'} space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-2xl ${isNight ? 'bg-[#181818] border border-[#2A2A2A]' : 'bg-[#1B4332] border border-emerald-400/30'} flex items-center justify-center shadow-lg shrink-0`}>
                <Satellite className="h-5 w-5 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white">
                  {lang === 'bn' ? 'ফিল্ড শিফট' : 'Field Shift'}
                </h1>
                <span className={`text-[10px] font-semibold block leading-tight ${isNight ? 'text-emerald-400' : 'text-emerald-300'}`}>
                  {lang === 'bn' ? 'নাসা স্যাটেলাইট কৃষি পোর্টাল' : 'NASA Earth Observation DSS'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Card inside Sidebar */}
          <div className={`p-3.5 rounded-2xl border ${isNight ? 'bg-[#0E0E0E] border-[#222222]' : 'bg-[#143B2A] border-[#1D523B]'} flex items-center justify-between gap-3 text-white`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className={`text-2xl p-1 rounded-xl ${isNight ? 'bg-[#1A1A1A]' : 'bg-[#0B2519]'} shrink-0`}>
                {user.photo || (user.role === 'farmer' ? '👨‍🌾' : '👨‍💻')}
              </span>
              <div className="truncate">
                <h4 className="text-xs font-black truncate text-white">{user.name}</h4>
                <span className={`text-[10px] font-bold block ${user.role === 'admin' ? 'text-purple-300' : 'text-emerald-300'}`}>
                  {user.role === 'admin' ? (lang === 'bn' ? 'এডমিন (Admin)' : 'Admin') : (lang === 'bn' ? 'কৃষক (Farmer)' : 'Farmer')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('user_account');
                  setIsMobileMenuOpen(false);
                }}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
                title={lang === 'bn' ? 'প্রোফাইল সম্পাদন' : 'Edit Profile'}
              >
                <User className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setUser(null)}
                className="p-1.5 text-slate-300 hover:text-red-400 rounded-lg hover:bg-white/10"
                title={lang === 'bn' ? 'লগআউট' : 'Sign Out'}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Center of Sidebar: Vertical Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-3 mb-2 block ${isNight ? 'text-slate-400' : 'text-emerald-200/80'}`}>
            {lang === 'bn' ? 'প্রধান মেন্যু' : 'Main Navigation'}
          </span>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left group ${
                  isActive
                    ? isNight
                      ? 'bg-[#151515] text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'bg-[#2D6A4F] text-white border border-emerald-300/40 shadow-md'
                    : isNight
                    ? 'text-slate-400 hover:text-white hover:bg-[#111111]'
                    : 'text-emerald-100 hover:text-white hover:bg-[#143B2A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? (isNight ? 'text-emerald-400' : 'text-white') : (isNight ? 'text-slate-400' : 'text-emerald-300')}`} />
                  <span className="leading-snug">{lang === 'bn' ? item.labelBn : item.labelEn}</span>
                </div>
                {isActive && <ChevronRight className={`h-4 w-4 shrink-0 ${isNight ? 'text-emerald-400' : 'text-white'}`} />}
              </button>
            );
          })}
        </div>

        {/* Bottom of Sidebar: Language, Day/Night Controls & Attribution */}
        <div className={`p-4 border-t ${isNight ? 'border-[#1F1F1F] bg-black' : 'border-[#16442F] bg-[#081B12]'} space-y-3`}>
          <div className="flex items-center justify-between gap-2">
            {/* Language Switcher */}
            <div className={`flex items-center p-1 rounded-xl border ${isNight ? 'border-[#262626] bg-[#111111]' : 'border-[#1D523B] bg-[#143B2A]'} w-fit`}>
              <button
                onClick={() => setLang('bn')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'bn'
                    ? isNight ? 'bg-emerald-600 text-white' : 'bg-white text-[#0B2519] shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'en'
                    ? isNight ? 'bg-emerald-600 text-white' : 'bg-white text-[#0B2519] shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Day / Night Mood Toggle */}
            <button
              onClick={() => setTheme(isNight ? 'day' : 'night')}
              title="Toggle Day/Night Mode"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                isNight
                  ? 'border-[#262626] bg-[#111111] text-amber-300 hover:bg-[#1A1A1A]'
                  : 'border-[#1D523B] bg-[#143B2A] text-emerald-200 hover:text-white'
              } text-xs font-bold transition-all`}
            >
              {isNight ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{isNight ? (lang === 'bn' ? 'দিন (হান্টার গ্রিন)' : 'Day') : (lang === 'bn' ? 'রাত (ফুল ব্ল্যাক)' : 'Night')}</span>
            </button>
          </div>

          <div className={`text-[10px] text-center pt-1 ${isNight ? 'text-slate-400' : 'text-emerald-200/80'}`}>
            NASA Space Apps 2026 • Bangladesh 64 Districts
          </div>
        </div>
      </aside>

      {/* ===================================================================== */}
      {/* --- RIGHT-SIDE MAIN WORKSPACE CONTAINER ---                           */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* TOP STATUS BAR */}
        <header className={`border-b ${bgTopHeader} backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-xl border ${isNight ? 'border-[#262626] text-slate-300' : 'border-emerald-200 text-[#0B2519]'}`}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold hidden sm:inline ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                {lang === 'bn' ? 'নির্বাচিত জেলা:' : 'Selected District:'}
              </span>
              <span className={`text-sm lg:text-base font-extrabold flex items-center gap-1.5 ${isNight ? 'text-emerald-400' : 'text-[#1B4332]'}`}>
                <MapPin className="h-4 w-4 shrink-0" />
                {lang === 'bn' ? selectedDistrict.nameBn : selectedDistrict.name}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isNight ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-[#1B4332] border-emerald-200'}`}>
                {selectedDistrict.division} {lang === 'bn' ? 'বিভাগ' : 'Division'}
              </span>
            </div>
          </div>

          {/* Quick 64 District Dropdown in Top Bar */}
          <div className="flex items-center gap-3">
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className={`text-xs font-bold rounded-xl px-3 py-2 border shadow-sm outline-none cursor-pointer max-w-[220px] truncate ${
                isNight
                  ? 'bg-[#0E0E0E] text-emerald-300 border-[#262626] focus:ring-2 focus:ring-emerald-500'
                  : 'bg-white text-[#0B2519] border-emerald-200 focus:ring-2 focus:ring-[#1B4332]'
              }`}
            >
              {['Dhaka', 'Rajshahi', 'Chittagong', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'].map(divName => (
                <optgroup key={divName} label={`--- ${divName} Division (${ALL_DISTRICTS.filter(d => d.division === divName).length} Districts) ---`}>
                  {ALL_DISTRICTS.filter(d => d.division === divName).map(dist => (
                    <option key={dist.id} value={dist.id}>
                      📍 {lang === 'bn' ? dist.nameBn : dist.name} ({dist.name})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <button
              onClick={() => setActiveTab('report')}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs transition-all shrink-0 ${primaryBtn}`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'রিপোর্ট' : 'Dossier'}</span>
            </button>
          </div>
        </header>

        {/* SUB-BANNER: Agro-Ecological Baseline of Selected District */}
        <div className={`px-4 lg:px-8 py-3 border-b ${bgDistrictBar}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className={isNight ? 'text-slate-400' : 'text-slate-600'}>{lang === 'bn' ? 'মাটি:' : 'Soil:'}</span>
              <strong className={textTitle}>{selectedDistrict.soil}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className={isNight ? 'text-slate-400' : 'text-slate-600'}>{lang === 'bn' ? 'বৃষ্টিপাত:' : 'Rainfall:'}</span>
              <strong className={isNight ? 'text-emerald-400' : 'text-[#1B4332]'}>{selectedDistrict.rainfall} mm/yr</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={isNight ? 'text-slate-400' : 'text-slate-600'}>{lang === 'bn' ? 'প্রধান ঝুঁকি:' : 'Primary Risk:'}</span>
              <span className="text-amber-500 font-bold">{lang === 'bn' ? selectedDistrict.riskBn : selectedDistrict.risk}</span>
            </div>
          </div>
        </div>

        {/* --- MAIN TAB CONTENT ROUTER --- */}
        <main className="p-4 lg:p-8 space-y-6 max-w-7xl w-full">

          {/* ======================================================== */}
          {/* TAB: USER ACCOUNT & EDITABLE PROFILE DASHBOARD           */}
          {/* ======================================================== */}
          {activeTab === 'user_account' && (
            <div className="space-y-6">
              <div className={`p-6 lg:p-8 rounded-3xl border ${bgCard} shadow-xl space-y-6`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b ${isNight ? 'border-[#1F1F1F]' : 'border-emerald-100'} gap-4`}>
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isNight ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-[#1B4332] border-emerald-200'}`}>
                      {lang === 'bn' ? 'ব্যবহারকারী একাউন্ট ব্যবস্থাপনা' : 'User Account Management'}
                    </span>
                    <h3 className={`text-xl font-black ${textTitle} mt-1 flex items-center gap-2`}>
                      <User className={`h-6 w-6 ${isNight ? 'text-emerald-400' : 'text-[#1B4332]'}`} />
                      <span>{lang === 'bn' ? 'প্রোফাইল তথ্য ও ড্যাশবোর্ড' : 'Profile Settings & Dashboard'}</span>
                    </h3>
                    <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      {lang === 'bn'
                        ? 'এখানে আপনি আপনার নাম, মোবাইল নম্বর এবং প্রোফাইল ছবি সম্পাদনা করতে পারবেন।'
                        : 'Edit your display name, phone number, and avatar photo for farm advisory reports.'}
                    </p>
                  </div>

                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin'
                        ? isNight ? 'bg-purple-950/60 text-purple-300 border border-purple-800' : 'bg-purple-50 text-purple-800 border border-purple-200'
                        : isNight ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' : 'bg-emerald-50 text-[#1B4332] border border-emerald-200'
                    }`}>
                      {user.role === 'admin' ? (lang === 'bn' ? 'এডমিন একাউন্ট' : 'Admin Role') : (lang === 'bn' ? 'কৃষক একাউন্ট' : 'Farmer Role')}
                    </span>
                  </div>
                </div>

                {/* Profile Edit Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left: Avatar Picker */}
                  <div className={`p-5 rounded-2xl border ${bgSubCard} flex flex-col items-center justify-center text-center space-y-3`}>
                    <div className={`text-6xl p-4 rounded-3xl border shadow-inner ${isNight ? 'bg-black border-[#262626]' : 'bg-white border-emerald-200'}`}>
                      {editPhoto || user.photo || '👨‍🌾'}
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${textTitle}`}>{user.name}</span>
                      <span className={`text-[11px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>{user.email}</span>
                    </div>

                    <div className="space-y-1.5 w-full pt-2">
                      <label className={`text-[11px] font-bold block ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                        {lang === 'bn' ? 'অবতার / ছবি নির্বাচন:' : 'Choose Avatar Icon:'}
                      </label>
                      <div className="flex items-center justify-center gap-2 text-xl">
                        {['👨‍🌾', '🧑‍🌾', '👨‍💻', '🚜', '🌾', '👨‍🔬'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setEditPhoto(emoji)}
                            className={`p-2 rounded-xl border transition-all ${
                              (editPhoto || user.photo) === emoji
                                ? isNight
                                  ? 'bg-[#1F1F1F] border-emerald-400 scale-110 shadow-sm'
                                  : 'bg-emerald-100 border-[#1B4332] scale-110 shadow-sm'
                                : isNight ? 'border-[#2A2A2A] hover:bg-[#1A1A1A]' : 'border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Editable Form */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className={`text-xs font-bold block mb-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                        {lang === 'bn' ? 'পূর্ণ নাম (Full Name):' : 'Full Name:'}
                      </label>
                      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${isNight ? 'border-[#262626] bg-[#0E0E0E]' : 'border-emerald-200 bg-white'}`}>
                        <User className={`h-4 w-4 ${isNight ? 'text-emerald-400' : 'text-[#1B4332]'}`} />
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="e.g. MR. RAJU or MD. NAZMUL HASAN"
                          className={`w-full bg-transparent outline-none text-sm font-bold ${textTitle}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`text-xs font-bold block mb-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                        {lang === 'bn' ? 'মোবাইল নম্বর (Phone Number):' : 'Phone Number:'}
                      </label>
                      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${isNight ? 'border-[#262626] bg-[#0E0E0E]' : 'border-emerald-200 bg-white'}`}>
                        <Phone className={`h-4 w-4 ${isNight ? 'text-emerald-400' : 'text-[#1B4332]'}`} />
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+880 1712-345678"
                          className={`w-full bg-transparent outline-none text-sm font-bold font-mono ${textTitle}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`text-xs font-bold block mb-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                        {lang === 'bn' ? 'গুগল মেইল (সংযুক্ত একাউন্ট):' : 'Connected Google Email:'}
                      </label>
                      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 text-xs ${isNight ? 'border-[#262626] bg-[#080808] text-slate-400' : 'border-emerald-100 bg-[#F4F9F5] text-slate-600'}`}>
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="font-mono">{user.email}</span>
                        <span className={`ml-auto text-[10px] px-2 py-0.5 rounded font-bold ${isNight ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-100 text-[#1B4332]'}`}>
                          Verified
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={handleSaveProfile}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs transition-all ${primaryBtn}`}
                      >
                        <Save className="h-4 w-4" />
                        <span>{lang === 'bn' ? 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন' : 'Save Profile Changes'}</span>
                      </button>

                      {profileSaveSuccess && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{lang === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: CROP ROTATION OPTIMIZER                           */}
          {/* ======================================================== */}
          {activeTab === 'rotation' && (
            <div className="space-y-6">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border ${bgCard} relative overflow-hidden`}>
                  <div className={`flex items-center justify-between text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>{lang === 'bn' ? 'মাটির স্বাস্থ্য স্কোর' : 'Soil Health Index'}</span>
                    <Sprout className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400">{recMetrics.soilScore}/100</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                      <TrendingUp className="h-3 w-3 mr-0.5" /> +{recMetrics.soilScore - tradMetrics.soilScore}
                    </span>
                  </div>
                  <span className={`text-[10px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                    {lang === 'bn' ? 'প্রচলিত ধারায় মাত্র' : 'Traditional baseline:'} {tradMetrics.soilScore}/100
                  </span>
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-emerald-500"></div>
                </div>

                <div className={`p-4 rounded-2xl border ${bgCard} relative overflow-hidden`}>
                  <div className={`flex items-center justify-between text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>{lang === 'bn' ? 'সেচের পানি সাশ্রয়' : 'Annual Water Savings'}</span>
                    <Droplets className="h-4 w-4 text-cyan-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-2xl lg:text-3xl font-black ${isNight ? 'text-cyan-400' : 'text-[#1B4332]'}`}>
                      {tradMetrics.totalWaterMm - recMetrics.totalWaterMm} mm
                    </span>
                    <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold">
                      ~{Math.round(((tradMetrics.totalWaterMm - recMetrics.totalWaterMm) / tradMetrics.totalWaterMm) * 100)}%
                    </span>
                  </div>
                  <span className={`text-[10px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                    {lang === 'bn' ? 'ভূগর্ভস্থ পানি রক্ষা পাবে' : 'Prevents aquifer collapse'}
                  </span>
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-cyan-500"></div>
                </div>

                <div className={`p-4 rounded-2xl border ${bgCard} relative overflow-hidden`}>
                  <div className={`flex items-center justify-between text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>{lang === 'bn' ? 'প্রাকৃতিক নাইট্রোজেন সঞ্চয়' : 'Nitrogen Balance'}</span>
                    <Layers className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-2xl lg:text-3xl font-black ${recMetrics.netNitrogen >= 0 ? (isNight ? 'text-indigo-400' : 'text-indigo-700') : 'text-amber-500'}`}>
                      {recMetrics.netNitrogen > 0 ? `+${recMetrics.netNitrogen}` : recMetrics.netNitrogen} kg/ha
                    </span>
                  </div>
                  <span className={`text-[10px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                    {lang === 'bn' ? 'ইউরিয়া সারের খরচ ৪০% কমবে' : 'Cuts synthetic urea by ~40%'}
                  </span>
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-indigo-500"></div>
                </div>

                <div className={`p-4 rounded-2xl border ${bgCard} relative overflow-hidden`}>
                  <div className={`flex items-center justify-between text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>{lang === 'bn' ? 'খরা ও তাপদাহ সহনশীলতা' : 'Climate Resilience'}</span>
                    <ShieldCheck className="h-4 w-4 text-teal-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-2xl lg:text-3xl font-black ${isNight ? 'text-teal-400' : 'text-[#1B4332]'}`}>{recMetrics.yieldResilience}%</span>
                    <span className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center">
                      <TrendingUp className="h-3 w-3 mr-0.5" /> +{recMetrics.yieldResilience - tradMetrics.yieldResilience}%
                    </span>
                  </div>
                  <span className={`text-[10px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                    {lang === 'bn' ? 'নাসা স্ম্যাপ (SMAP) ক্যালিব্রেটেড' : 'SMAP telemetry verified'}
                  </span>
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-teal-500"></div>
                </div>
              </div>

              {/* Side-by-Side Sequences */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* RECOMMENDED PLAN */}
                <div className={`p-5 rounded-3xl border-2 ${isNight ? 'border-emerald-500/50 bg-[#0A0A0A]' : 'border-[#1B4332]/60 bg-white'} shadow-xl space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`p-2 rounded-xl ${isNight ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-100 text-[#1B4332]'}`}>
                        <Sparkles className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className={`font-extrabold text-sm lg:text-base ${textTitle}`}>
                          {lang === 'bn' ? 'নাসা-স্মার্ট জলবায়ু সহনশীল ফসল পর্যায়ক্রম' : 'NASA-Adaptive Recommended Rotation'}
                        </h3>
                        <p className={`text-xs font-medium ${isNight ? 'text-emerald-400' : 'text-[#1B4332]'}`}>
                          {lang === 'bn' ? `${selectedDistrict.nameBn} জেলার মাটির জন্য বিশেষভাবে সাজানো` : `Calibrated for ${selectedDistrict.name} agro-ecology`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${isNight ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-[#1B4332] border-emerald-200'}`}>
                      {lang === 'bn' ? 'সর্বোত্তম পরামর্শ' : 'Top Recommendation'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {recommendedPlan.map((cropId, idx) => {
                      const crop = CROP_DATABASE[cropId];
                      return (
                        <div key={idx} className={`p-3.5 rounded-2xl border ${bgSubCard} flex items-center justify-between gap-3`}>
                          <div className="flex items-center gap-3">
                            <span className={`h-7 w-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${isNight ? 'bg-[#1F1F1F] text-emerald-400' : 'bg-[#1B4332] text-white'}`}>
                              {lang === 'bn' ? `মৌসুম ${idx + 1}` : `S${idx + 1}`}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-bold text-xs lg:text-sm ${textTitle}`}>
                                  {lang === 'bn' ? crop.nameBn : crop.name}
                                </h4>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isNight ? 'bg-[#222222] text-slate-300' : 'bg-emerald-100 text-[#1B4332]'}`}>
                                  {lang === 'bn' ? crop.categoryBn : crop.category}
                                </span>
                              </div>
                              <div className={`flex flex-wrap items-center gap-3 text-[11px] mt-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                                <span>{lang === 'bn' ? 'পানি:' : 'Water:'} <strong className={isNight ? 'text-emerald-400' : 'text-[#1B4332]'}>{crop.waterMm}mm</strong></span>
                                <span>{lang === 'bn' ? 'নাইট্রোজেন:' : 'N-Yield:'} <strong className={crop.nBalanceKgHa > 0 ? (isNight ? 'text-emerald-400' : 'text-emerald-700') : 'text-amber-500'}>{crop.nBalanceKgHa > 0 ? `+${crop.nBalanceKgHa}` : crop.nBalanceKgHa} kg</strong></span>
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
                            className={`text-xs rounded-xl px-2 py-1 border outline-none cursor-pointer ${
                              isNight ? 'bg-[#161616] text-slate-200 border-[#2A2A2A]' : 'bg-white text-slate-800 border-emerald-200'
                            }`}
                          >
                            {Object.values(CROP_DATABASE).map(c => (
                              <option key={c.id} value={c.id}>
                                {lang === 'bn' ? c.nameBn : c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${isNight ? 'bg-[#101010] border-[#222222] text-slate-300' : 'bg-[#EBF5EE] border-emerald-200 text-[#0B2519]'}`}>
                    <div className={`font-bold flex items-center gap-1.5 ${isNight ? 'text-emerald-400' : 'text-[#1B4332]'}`}>
                      <Info className="h-4 w-4" />
                      <span>{lang === 'bn' ? 'কেন এই ফসল বিন্যাস বিজ্ঞানসম্মত?' : 'Why is this sequence recommended?'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {lang === 'bn'
                        ? `১. সরিষা চাষে পোকা-মাকড়ের জীবনচক্র ভেঙে যায়। ২. ছোলা ও মুগডাল মাটির গভীরে শিকড় পাঠিয়ে পানি ধরে রাখে এবং জমিতে প্রাকৃতিক সার যোগ করে। ৩. বোরো ধানের অতিরিক্ত সেচ এড়িয়ে বছরে মোট ${tradMetrics.totalWaterMm - recMetrics.totalWaterMm} মিমি পানি সাশ্রয় হয়।`
                        : `1. Brassica (mustard) interrupts soil fungal pathogen cycles. 2. Legumes fix atmospheric nitrogen, replenishing depleted soil. 3. Reduces annual groundwater pumping by ${tradMetrics.totalWaterMm - recMetrics.totalWaterMm}mm.`}
                    </p>
                  </div>
                </div>

                {/* TRADITIONAL MONOCULTURE BASELINE */}
                <div className={`p-5 rounded-3xl border ${bgCard} shadow-xl space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                        <AlertTriangle className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className={`font-extrabold text-sm lg:text-base ${textTitle}`}>
                          {lang === 'bn' ? 'কৃষকের প্রচলিত প্রথা (ধান-ধান মনোকালচার)' : 'Current Practice (Monoculture)'}
                        </h3>
                        <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                          {lang === 'bn' ? 'অতিরিক্ত পানি অপচয় ও মাটির উর্বরতা ক্ষয়' : 'Heavy groundwater exploitation & soil degradation'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      {lang === 'bn' ? 'উচ্চ পরিবেশগত ঝুঁকি' : 'High Risk'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {traditionalPlan.map((cropId, idx) => {
                      const crop = CROP_DATABASE[cropId];
                      return (
                        <div key={idx} className={`p-3.5 rounded-2xl border ${bgSubCard} flex items-center justify-between gap-3`}>
                          <div className="flex items-center gap-3">
                            <span className={`h-7 w-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${isNight ? 'bg-[#1C1C1C] text-slate-400' : 'bg-slate-200 text-slate-700'}`}>
                              {lang === 'bn' ? `মৌসুম ${idx + 1}` : `S${idx + 1}`}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-bold text-xs lg:text-sm ${textTitle}`}>
                                  {lang === 'bn' ? crop.nameBn : crop.name}
                                </h4>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isNight ? 'bg-[#222222] text-slate-400' : 'bg-slate-200 text-slate-700'}`}>
                                  {lang === 'bn' ? crop.categoryBn : crop.category}
                                </span>
                              </div>
                              <div className={`flex flex-wrap items-center gap-3 text-[11px] mt-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
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
                            className={`text-xs rounded-xl px-2 py-1 border outline-none cursor-pointer ${
                              isNight ? 'bg-[#161616] text-slate-200 border-[#2A2A2A]' : 'bg-white text-slate-800 border-emerald-200'
                            }`}
                          >
                            {Object.values(CROP_DATABASE).map(c => (
                              <option key={c.id} value={c.id}>
                                {lang === 'bn' ? c.nameBn : c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${isNight ? 'bg-[#181108] border-amber-900/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>
                    <div className="font-bold flex items-center gap-1.5 text-amber-500">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{lang === 'bn' ? 'প্রচলিত চাষাবাদের ক্ষতিকর প্রভাব:' : 'Vulnerability Assessment:'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
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
          {/* TAB 2: WHAT-IF CLIMATE SIMULATOR                         */}
          {/* ======================================================== */}
          {activeTab === 'whatif' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border ${bgCard} space-y-6 shadow-xl`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b ${isNight ? 'border-[#1F1F1F]' : 'border-emerald-100'} gap-4`}>
                  <div>
                    <h3 className={`text-lg font-black flex items-center gap-2 ${textTitle}`}>
                      <Sliders className={`h-5 w-5 ${isNight ? 'text-emerald-400' : 'text-[#1B4332]'}`} />
                      <span>{lang === 'bn' ? 'কৃষকের হোয়াট-ইফ জলবায়ু সিমুলেটর' : 'Farmer What-If Climate Simulator'}</span>
                    </h3>
                    <p className={`text-xs mt-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
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
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 w-fit ${
                      isNight ? 'bg-[#1A1A1A] border-[#2A2A2A] text-slate-300 hover:bg-[#252525]' : 'bg-[#F2F9F4] border-emerald-200 text-[#1B4332] hover:bg-emerald-100'
                    }`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{lang === 'bn' ? 'রিসেট করুন' : 'Reset Sliders'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 1. Rainfall */}
                  <div className={`p-4 rounded-2xl border ${bgSubCard} space-y-2`}>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="h-4 w-4 text-cyan-500" />
                        {lang === 'bn' ? 'বৃষ্টিপাত পরিবর্তন' : 'Rainfall Shift'}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono ${simRainfallDelta < 0 ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                        {simRainfallDelta > 0 ? `+${simRainfallDelta}%` : `${simRainfallDelta}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      step="5"
                      value={simRainfallDelta}
                      onChange={(e) => setSimRainfallDelta(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className={`flex justify-between text-[10px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>{lang === 'bn' ? '-৪০% (তীব্র খরা)' : '-40% (Drought)'}</span>
                      <span>০%</span>
                      <span>{lang === 'bn' ? '+৪০% (অতিবৃষ্টি)' : '+40% (Flood)'}</span>
                    </div>
                  </div>

                  {/* 2. Temperature */}
                  <div className={`p-4 rounded-2xl border ${bgSubCard} space-y-2`}>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sun className="h-4 w-4 text-amber-500" />
                        {lang === 'bn' ? 'তাপমাত্রা বৃদ্ধি' : 'Temp Increase'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-mono">
                        +{simTempDelta}°C
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="4.0"
                      step="0.5"
                      value={simTempDelta}
                      onChange={(e) => setSimTempDelta(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className={`flex justify-between text-[10px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>+০°C</span>
                      <span>+২°C</span>
                      <span>+৪°C</span>
                    </div>
                  </div>

                  {/* 3. Irrigation Cut */}
                  <div className={`p-4 rounded-2xl border ${bgSubCard} space-y-2`}>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-red-500" />
                        {lang === 'bn' ? 'সেচের পানি ঘাটতি' : 'Irrigation Cut'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 font-mono">
                        -{simIrrigationConstraint}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="10"
                      value={simIrrigationConstraint}
                      onChange={(e) => setSimIrrigationConstraint(Number(e.target.value))}
                      className="w-full accent-red-500 cursor-pointer"
                    />
                    <div className={`flex justify-between text-[10px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>{lang === 'bn' ? 'পূর্ণ সেচ (০%)' : 'Normal (0%)'}</span>
                      <span>-৩০%</span>
                      <span>{lang === 'bn' ? '-৬০% (চরম সংকট)' : '-60% (Crisis)'}</span>
                    </div>
                  </div>
                </div>

                {/* Reaction Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 rounded-2xl border border-red-500/40 bg-red-950/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-red-500 text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{lang === 'bn' ? 'প্রচলিত পদ্ধতিতে ক্ষতির আশঙ্কা' : 'Traditional Strategy Under Shock'}</span>
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                        {lang === 'bn' ? 'ফসল বিপর্যয়' : 'Crop Failure Risk'}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{lang === 'bn' ? 'ফলন টিকে থাকার সম্ভাবনা' : 'Yield Survival Rate'}</span>
                        <strong className="text-red-500">{simTradMetrics.yieldResilience}%</strong>
                      </div>
                      <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${simTradMetrics.yieldResilience}%` }} className="bg-red-500 h-full"></div>
                      </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      {lang === 'bn'
                        ? `${simRainfallDelta}% বৃষ্টিপাত কমে যাওয়ায় ও ${simIrrigationConstraint}% পানির ঘাটতিতে বোরো ধানের শীষ শুকিয়ে ব্যাপক চিটা দেখা দেবে।`
                        : `Severe soil moisture depletion causes severe sterility in flowering rice crops with high financial loss.`}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className={`font-bold text-sm flex items-center gap-2 ${isNight ? 'text-emerald-400' : 'text-[#1B4332]'}`}>
                        <ShieldCheck className="h-4 w-4" />
                        <span>{lang === 'bn' ? 'নাসা-স্মার্ট পদ্ধতিতে ফসলের সুরক্ষা' : 'NASA-Adaptive Crop Survival'}</span>
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                        {lang === 'bn' ? 'নিরাপদ ও লাভজনক' : 'Protected'}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{lang === 'bn' ? 'ফলন টিকে থাকার সম্ভাবনা' : 'Yield Survival Rate'}</span>
                        <strong className={isNight ? 'text-emerald-400' : 'text-[#1B4332]'}>{simRecMetrics.yieldResilience}%</strong>
                      </div>
                      <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${simRecMetrics.yieldResilience}%` }} className="bg-emerald-500 h-full"></div>
                      </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isNight ? 'text-slate-300' : 'text-slate-700'}`}>
                      {lang === 'bn'
                        ? `ছোলা ও মুগডাল মাটির নিচ থেকে পানি টেনে নেয়ায় তীব্র খরার মধ্যেও ${simRecMetrics.yieldResilience}% ফলন নিশ্চিত থাকবে।`
                        : `Deep taproots of legumes tap residual subsoil moisture, safeguarding ${simRecMetrics.yieldResilience}% yield stability.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: ADMIN DASHBOARD & BROADCAST ALERT                   */}
          {/* ======================================================== */}
          {activeTab === 'admin' && user.role === 'admin' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border ${bgCard} space-y-6 shadow-xl`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b ${isNight ? 'border-[#1F1F1F]' : 'border-emerald-100'} gap-4`}>
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isNight ? 'bg-purple-950/60 text-purple-300 border-purple-800' : 'bg-purple-50 text-purple-800 border-purple-200'}`}>
                      {lang === 'bn' ? 'নাসা স্পেস অ্যাপস ও কৃষি সম্প্রসারণ অধিদপ্তর এডমিন প্যানেল' : 'NASA Space Apps & DAE Admin Panel'}
                    </span>
                    <h3 className={`text-xl font-black ${textTitle} mt-1 flex items-center gap-2`}>
                      <Radio className="h-6 w-6 text-purple-500" />
                      <span>{lang === 'bn' ? 'বিভাগীয় খরা ও জলবায়ু জরুরি সতর্কতা সম্প্রচার' : 'Regional Climate Emergency Broadcast'}</span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      Lead Administrator: <strong className={isNight ? 'text-purple-300' : 'text-purple-800'}>MD. NAZMUL HASAN</strong>
                    </p>
                  </div>
                  <div className={`text-xs font-mono px-3 py-1.5 rounded-xl border ${isNight ? 'bg-[#181818] border-[#2A2A2A] text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
                    {lang === 'bn' ? 'নিবন্ধিত কৃষক: ১৪,২৮০ জন' : 'Registered Farmers: 14,280'}
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border ${bgSubCard} space-y-4`}>
                  <h4 className={`font-bold text-sm flex items-center gap-2 ${isNight ? 'text-purple-300' : 'text-purple-900'}`}>
                    <BellRing className="h-4 w-4 text-purple-500" />
                    <span>{lang === 'bn' ? 'কৃষকদের মোবাইল এসএমএস ও অ্যাপে জরুরি সতর্কতা পাঠান' : 'Broadcast Advisory to Farmers'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-bold block mb-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                        {lang === 'bn' ? 'লক্ষ্য বিভাগ নির্বাচন:' : 'Target Division:'}
                      </label>
                      <select
                        value={adminDivision}
                        onChange={(e) => setAdminDivision(e.target.value)}
                        className={`w-full text-xs font-bold p-2.5 rounded-xl border ${
                          isNight ? 'bg-[#161616] text-white border-[#2A2A2A]' : 'bg-white text-slate-800 border-emerald-200'
                        }`}
                      >
                        {['Rajshahi', 'Rangpur', 'Khulna', 'Chittagong', 'Barishal', 'Dhaka', 'Sylhet', 'Mymensingh'].map(d => (
                          <option key={d} value={d}>{d} {lang === 'bn' ? 'বিভাগ' : 'Division'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`text-xs font-bold block mb-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                        {lang === 'bn' ? 'সতর্কতার ধরণ:' : 'Warning Type:'}
                      </label>
                      <select
                        value={adminWarningType}
                        onChange={(e) => setAdminWarningType(e.target.value)}
                        className={`w-full text-xs font-bold p-2.5 rounded-xl border ${
                          isNight ? 'bg-[#161616] text-white border-[#2A2A2A]' : 'bg-white text-slate-800 border-emerald-200'
                        }`}
                      >
                        <option value="খরা ও ভূগর্ভস্থ পানি সতর্কতা">খরা ও ভূগর্ভস্থ পানি সংকট (Drought & Moisture Deficit)</option>
                        <option value="লবণাক্ততা বৃদ্ধি সতর্কতা">উপকূলীয় মাটিতে লবণাক্ততা বৃদ্ধি (Soil Salinity Surge)</option>
                        <option value="আগাম পাহাড়ি ঢল ও বন্যা">আগাম পাহাড়ি ঢল ও হাওর বন্যা (Early Flash Flood)</option>
                        <option value="তীব্র শৈত্যপ্রবাহ ও কুয়াশা">তীব্র শৈত্যপ্রবাহ ও কুয়াশা (Cold Wave Advisory)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-xs font-bold block ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      {lang === 'bn' ? 'কৃষকদের জন্য স্বয়ংক্রিয় বার্তা:' : 'Generated Message Payload:'}
                    </label>
                    <textarea
                      rows={3}
                      readOnly
                      value={`[জরুরি বার্তা - প্রেরক: মো. নাজমুল হাসান (এডমিন, ফিল্ড শিফট)]: ${adminDivision} বিভাগে ${adminWarningType} জারি করা হয়েছে। বোরো ধানের অতিরিক্ত সেচ পরিহার করে ডাল ও সরিষা চাষে সুইচ করার পরামর্শ দেয়া হচ্ছে।`}
                      className={`w-full text-xs font-mono p-3 rounded-xl border ${isNight ? 'bg-black text-slate-300 border-[#2A2A2A]' : 'bg-white text-slate-800 border-emerald-200'}`}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setAlertBroadcastSent(true);
                      setTimeout(() => setAlertBroadcastSent(false), 4000);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-700/30 transition-all"
                  >
                    <Send className="h-4 w-4" />
                    <span>{lang === 'bn' ? '১৪,২৮০ জন কৃষকের মোবাইলে ব্রডকাস্ট করুন' : 'Dispatch Broadcast to 14,280 Farmers'}</span>
                  </button>

                  {alertBroadcastSent && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{lang === 'bn' ? 'সতর্কতা বার্তা সফলভাবে প্রেরণ করা হয়েছে!' : 'Alert broadcast successfully dispatched!'}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl border ${bgSubCard}`}>
                    <div className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>NASA POWER API Status</div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">99.8% Online (32ms)</div>
                    <div className={`text-[11px] mt-0.5 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>Precipitation & Radiation Engine</div>
                  </div>
                  <div className={`p-4 rounded-xl border ${bgSubCard}`}>
                    <div className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>NASA SMAP 9km Grid</div>
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">Calibrated (6h ago)</div>
                    <div className={`text-[11px] mt-0.5 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>L-Band Soil Moisture Telemetry</div>
                  </div>
                  <div className={`p-4 rounded-xl border ${bgSubCard}`}>
                    <div className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>Lead System Admin</div>
                    <div className={`text-lg font-bold mt-1 ${textTitle}`}>MD. NAZMUL HASAN</div>
                    <div className={`text-[11px] mt-0.5 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>Agricultural System Architect</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: SOIL & WATER ANALYTICS                            */}
          {/* ======================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`p-6 rounded-3xl border ${bgCard} space-y-4 shadow-xl`}>
                  <h3 className={`font-black text-base ${textTitle} flex items-center gap-2`}>
                    <BarChart3 className="h-5 w-5 text-indigo-500" />
                    <span>{lang === 'bn' ? 'ফসলের সার্বিক সক্ষমতা ও লাভজনকতা' : 'Comprehensive Rotation Performance'}</span>
                  </h3>
                  <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
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
                            <strong className={isNight ? 'text-emerald-400' : 'text-[#1B4332]'}>{item.ad}%</strong> vs <span className="text-slate-400">{item.tr}%</span>
                          </span>
                        </div>
                        <div className={`h-3 rounded-full overflow-hidden flex ${isNight ? 'bg-[#1F1F1F]' : 'bg-slate-200'}`}>
                          <div style={{ width: `${item.ad}%` }} className={`h-full rounded-full ${isNight ? 'bg-emerald-500' : 'bg-[#1B4332]'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3-Year Soil Organic Matter Forecast */}
                <div className={`p-6 rounded-3xl border ${bgCard} space-y-4 shadow-xl flex flex-col justify-between`}>
                  <div>
                    <h3 className={`font-black text-base ${textTitle} flex items-center gap-2`}>
                      <Layers className="h-5 w-5 text-emerald-500" />
                      <span>{lang === 'bn' ? '৩ বছরে মাটির জৈব পদার্থের (SOM) পরিবর্তন' : '3-Year Soil Organic Matter Projection'}</span>
                    </h3>
                    <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      {lang === 'bn'
                        ? 'ডাল জাতীয় ফসল ও সবুজ সার ব্যবহারের ফলে মাটির কার্বন বৃদ্ধি'
                        : 'Soil organic carbon enhancement modeled via legume biomass residue'}
                    </p>

                    <div className="grid grid-cols-3 gap-3 my-6">
                      <div className={`p-3.5 rounded-2xl border ${bgSubCard} text-center`}>
                        <span className={`text-[11px] block ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>{lang === 'bn' ? '১ম বছর' : 'Year 1'}</span>
                        <span className={`text-xl font-black ${textTitle}`}>১.৩৫%</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">+০.১৫% SOM</span>
                      </div>
                      <div className={`p-3.5 rounded-2xl border ${bgSubCard} text-center`}>
                        <span className={`text-[11px] block ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>{lang === 'bn' ? '২য় বছর' : 'Year 2'}</span>
                        <span className={`text-xl font-black ${textTitle}`}>১.৬৮%</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">+০.৪৮% SOM</span>
                      </div>
                      <div className={`p-3.5 rounded-2xl border ${bgSubCard} text-center`}>
                        <span className={`text-[11px] block ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>{lang === 'bn' ? '৩য় বছর' : 'Year 3'}</span>
                        <span className={`text-xl font-black ${isNight ? 'text-emerald-400' : 'text-[#1B4332]'}`}>২.১০%</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">+০.৯০% SOM</span>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed p-3.5 rounded-2xl border ${
                      isNight ? 'bg-[#0E1B13] border-emerald-900/40 text-emerald-200' : 'bg-[#EBF5EE] border-emerald-200 text-[#0B2519]'
                    }`}>
                      🌱 {lang === 'bn'
                        ? `${selectedDistrict.nameBn} জেলার মাটিতে বর্তমানে জৈব পদার্থ ${soilOrganicMatter}%। এই পর্যায়ক্রম মানলে ৩ বছরে তা ২.১০% এ উন্নীত হবে এবং সেচের পানি ধরে রাখার ক্ষমতা ৩৫% বৃদ্ধি পাবে।`
                        : `Initial soil organic matter is ${soilOrganicMatter}%. With adaptive legume rotations, organic carbon rises to 2.10%, increasing water infiltration by 35%.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: NASA SATELLITE TELEMETRY                          */}
          {/* ======================================================== */}
          {activeTab === 'nasa' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border ${bgCard} space-y-6 shadow-xl`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isNight ? 'border-[#1F1F1F]' : 'border-emerald-100'}`}>
                  <div>
                    <h3 className={`text-lg font-black flex items-center gap-2 ${textTitle}`}>
                      <Satellite className="h-5 w-5 text-blue-500" />
                      <span>{lang === 'bn' ? 'নাসা আর্থ অবজারভেশন উপগ্রহ লাইভ ডাটা' : 'Active NASA Earth Observation Telemetry'}</span>
                    </h3>
                    <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      {lang === 'bn' ? `${selectedDistrict.nameBn} জেলার ভৌগোলিক স্থানাঙ্ক: ${selectedDistrict.lat}°N, ${selectedDistrict.lng}°E` : `GPS: ${selectedDistrict.lat}°N, ${selectedDistrict.lng}°E`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-2xl border ${bgSubCard}`}>
                    <div className={`flex items-center justify-between text-xs mb-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>NASA POWER</span>
                      <Sun className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className={`text-xl font-black ${textTitle}`}>{selectedDistrict.rainfall} mm</div>
                    <div className={`text-[11px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>{lang === 'bn' ? 'বার্ষিক গড় বৃষ্টিপাত' : 'Mean Annual Rainfall'}</div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${bgSubCard}`}>
                    <div className={`flex items-center justify-between text-xs mb-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>NASA SMAP</span>
                      <Droplets className="h-4 w-4 text-cyan-500" />
                    </div>
                    <div className={`text-xl font-black ${isNight ? 'text-cyan-400' : 'text-[#1B4332]'}`}>০.১৮ m³/m³</div>
                    <div className={`text-[11px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>{lang === 'bn' ? 'মাটির আর্দ্রতা (শিকড় স্তর)' : 'Root-Zone Moisture'}</div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${bgSubCard}`}>
                    <div className={`flex items-center justify-between text-xs mb-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>MODIS / Landsat</span>
                      <Sprout className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">০.৫৬ NDVI</div>
                    <div className={`text-[11px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>{lang === 'bn' ? 'সবুজের ঘনত্ব সূচক' : 'Vegetation Canopy Health'}</div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${bgSubCard}`}>
                    <div className={`flex items-center justify-between text-xs mb-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>ECOSTRESS</span>
                      <Flame className="h-4 w-4 text-red-500" />
                    </div>
                    <div className={`text-xl font-black ${textTitle}`}>৪.১ mm/day</div>
                    <div className={`text-[11px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>{lang === 'bn' ? 'বাষ্পীভবন ও পানির টান' : 'Evapotranspiration'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: FARM & SOIL LAB PROFILE                           */}
          {/* ======================================================== */}
          {activeTab === 'farm_profile' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border ${bgCard} space-y-6 shadow-xl`}>
                <h3 className={`text-lg font-black flex items-center gap-2 ${textTitle}`}>
                  <Layers className={`h-5 w-5 ${isNight ? 'text-emerald-400' : 'text-[#1B4332]'}`} />
                  <span>{lang === 'bn' ? 'খামার ও মাটির ল্যাব টেস্ট তথ্য' : 'Farm Profile & Soil Lab Parameters'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      {lang === 'bn' ? 'মোট আবাদি জমি (বিঘা):' : 'Cultivated Area (Bigha):'}
                    </label>
                    <input
                      type="number"
                      value={farmSizeBigha}
                      onChange={(e) => setFarmSizeBigha(Number(e.target.value))}
                      className={`w-full text-sm font-bold p-2.5 rounded-xl border ${
                        isNight ? 'bg-[#161616] text-white border-[#2A2A2A]' : 'bg-white text-slate-800 border-emerald-200'
                      }`}
                    />
                    <span className={`text-[10px] ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>~{(farmSizeBigha * 0.33).toFixed(1)} {lang === 'bn' ? 'একর' : 'Acres'}</span>
                  </div>

                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      {lang === 'bn' ? 'মাটির ধরণ:' : 'Soil Texture:'}
                    </label>
                    <input
                      type="text"
                      value={selectedDistrict.soil}
                      readOnly
                      className={`w-full text-xs font-bold p-2.5 rounded-xl border ${
                        isNight ? 'bg-[#101010] text-emerald-400 border-[#222222]' : 'bg-[#F2F9F4] text-[#1B4332] border-emerald-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      {lang === 'bn' ? 'সেচ ব্যবস্থা:' : 'Irrigation Infrastructure:'}
                    </label>
                    <select
                      value={irrigationType}
                      onChange={(e) => setIrrigationType(e.target.value)}
                      className={`w-full text-xs font-bold p-2.5 rounded-xl border ${
                        isNight ? 'bg-[#161616] text-white border-[#2A2A2A]' : 'bg-white text-slate-800 border-emerald-200'
                      }`}
                    >
                      <option value="Deep Tube Well">গভীর নলকূপ (Deep Tube Well)</option>
                      <option value="Shallow Tube Well">অগভীর নলকূপ (Shallow Tube Well)</option>
                      <option value="Canal/Surface">খাল বা নদীর পানি (Canal/River)</option>
                      <option value="Rainfed">সম্পূর্ণ বৃষ্টি নির্ভর (Rainfed)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: FARM ACTION REPORT                                */}
          {/* ======================================================== */}
          {activeTab === 'report' && (
            <div className="space-y-6">
              <div className={`p-6 lg:p-8 rounded-3xl border ${bgCard} space-y-6 shadow-2xl`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b ${isNight ? 'border-[#1F1F1F]' : 'border-emerald-100'} gap-4`}>
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isNight ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-[#1B4332] border-emerald-200'}`}>
                      {lang === 'bn' ? 'কৃষক পরামর্শ ও কর্মপরিকল্পনা দলিল' : 'Official Farmer Decision Dossier'}
                    </span>
                    <h3 className={`text-xl font-black ${textTitle} mt-1`}>
                      {lang === 'bn' ? `${selectedDistrict.nameBn} জেলার জন্য ফসল পর্যায়ক্রম কর্মপরিকল্পনা` : `Farm Adaptation Plan for ${selectedDistrict.name} District`}
                    </h3>
                    <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                      {lang === 'bn' ? `কৃষক: ${user.name} (${user.phone}) • নাসা স্পেস অ্যাপস ২০২৬` : `Farmer: ${user.name} (${user.phone}) • NASA Space Apps 2026`}
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs transition-all w-fit ${primaryBtn}`}
                  >
                    <Download className="h-4 w-4" />
                    <span>{lang === 'bn' ? 'প্রিন্ট বা পিডিএফ ডাউনলোড' : 'Print / Download PDF'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className={`font-bold text-sm ${isNight ? 'text-emerald-400' : 'text-[#1B4332]'}`}>
                    {lang === 'bn' ? '৪-মৌসুমের বিস্তারিত ফসল রোপণ ও পরিচর্যা সূচি:' : 'Recommended 4-Season Implementation Schedule:'}
                  </h4>
                  {recommendedPlan.map((cropId, idx) => {
                    const c = CROP_DATABASE[cropId];
                    return (
                      <div key={idx} className={`p-4 rounded-2xl border ${bgSubCard} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                        <div className="flex items-center gap-3">
                          <span className={`h-8 w-8 rounded-xl font-black text-sm flex items-center justify-center ${isNight ? 'bg-[#222222] text-emerald-400' : 'bg-[#1B4332] text-white'}`}>
                            {idx + 1}
                          </span>
                          <div>
                            <div className={`font-bold text-sm ${textTitle}`}>
                              {lang === 'bn' ? c.nameBn : c.name} ({c.family})
                            </div>
                            <div className={`text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
                              {lang === 'bn' ? `জীবনকাল: ~${c.growingPeriodDays} দিন • শিকড়: ${c.rootingDepthBn}` : `Duration: ~${c.growingPeriodDays} days • Roots: ${c.rootingDepth}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <span className={`font-bold ${c.nBalanceKgHa > 0 ? (isNight ? 'text-emerald-400' : 'text-emerald-700') : 'text-amber-500'}`}>
                            {c.nBalanceKgHa > 0 ? `+${c.nBalanceKgHa} kg/ha নাইট্রোজেন` : `${c.nBalanceKgHa} kg/ha`}
                          </span>
                          <span className={`block text-[11px] ${isNight ? 'text-cyan-400' : 'text-[#1B4332]'}`}>{c.waterMm} mm পানি চাহিদা</span>
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
        <footer className={`border-t ${isNight ? 'border-[#1C1C1C] bg-black' : 'border-emerald-100 bg-[#F4F9F5]'} py-6 px-4 lg:px-8 mt-auto text-center text-xs ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className={`font-bold ${isNight ? 'text-slate-300' : 'text-[#0B2519]'}`}>Field Shift (ফিল্ড শিফট)</span> • NASA Space Apps Challenge 2026
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>NASA POWER</span>
              <span>NASA SMAP</span>
              <span>NASA ECOSTRESS</span>
              <span>৬৪ জেলা ডেটাবেজ</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
