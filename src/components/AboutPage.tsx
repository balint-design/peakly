import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { LoginModal } from './LoginModal';
import { SignUpModal } from './SignUpModal';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Users, Mountain, Heart, Shield, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function AboutPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error('Error logging out');
    navigate('/');
  };

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Finde passende Partner:innen",
      description: "Vernetze dich mit Gleichgesinnten, die deine Leidenschaft für Outdoor-Aktivitäten teilen."
    },
    {
      icon: <Mountain className="w-8 h-8" />,
      title: "Teile deine Erfahrungen",
      description: "Dokumentiere deine Abenteuer und lasse andere von deinen Erfahrungen profitieren."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Gemeinsame Interessen",
      description: "Entdecke Menschen mit ähnlichen Zielen und plane gemeinsame Aktivitäten."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Sicherheit steht an erster Stelle",
      description: "Verifizierte Profile und ein sicheres Umfeld für deine Outdoor-Aktivitäten."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
        onSignUpClick={() => setShowSignUpModal(true)}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-[1000px] mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Gemeinsam draußen aktiv sein
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Peakly verbindet Menschen mit einer Leidenschaft für Outdoor-Aktivitäten. 
            Egal ob Klettern, Bergsteigen oder Wandern – finde die perfekten Partner:innen 
            für dein nächstes Abenteuer.
          </p>
          {!session && (
            <button
              onClick={() => setShowSignUpModal(true)}
              className="group bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-900 transition-all duration-200 font-safiro inline-flex items-center gap-3"
            >
              Jetzt kostenlos registrieren
              <ArrowRight className="w-5 h-5 transform transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-[1000px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-black">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-[1000px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Unsere Mission</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Wir glauben daran, dass Outdoor-Aktivitäten am schönsten sind, wenn man sie 
              mit anderen teilt. Peakly macht es einfach, die richtigen Menschen zu finden 
              und gemeinsam aktiv zu sein.
            </p>
          </div>

          <div className="aspect-video rounded-2xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80"
              alt="Mountain climbing"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-[1000px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Bereit für dein nächstes Abenteuer?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Erstelle jetzt dein Profil und finde die perfekten Partner:innen für 
            deine Outdoor-Aktivitäten.
          </p>
          {!session && (
            <button
              onClick={() => setShowSignUpModal(true)}
              className="group bg-white text-black px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 font-safiro inline-flex items-center gap-3"
            >
              Kostenlos registrieren
              <ArrowRight className="w-5 h-5 transform transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </section>

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSignUpClick={() => {
            setShowLoginModal(false);
            setShowSignUpModal(true);
          }}
        />
      )}

      {showSignUpModal && (
        <SignUpModal 
          onClose={() => setShowSignUpModal(false)}
          onLoginClick={() => {
            setShowSignUpModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
}

export default AboutPage;