import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Cpu,
  Activity,
  Microscope,
  ShieldCheck,
  Thermometer,
  Eye,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import FeatureShowcase from './FeatureShowcase';
import './Admin.css';

function AdminFeatures() {
  return (
    <div className="admin-shell-page">
      <FeatureShowcase />
    </div>
  );
}

export default AdminFeatures;
