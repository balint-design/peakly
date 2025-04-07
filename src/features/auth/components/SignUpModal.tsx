  import React, { useState, useEffect } from 'react';
  import { X, User, Upload, AlertCircle, Check } from 'lucide-react';
  import { useNavigate } from 'react-router-dom';
  import { signUp, checkUsernameAvailability } from '../api/auth';
  import { SKILL_LEVELS } from '../../../lib/skills';
  import { uploadAvatar } from '../../../lib/storage';
  import { AVAILABLE_SKILLS } from '../../../types/database';
  import { LocationInput } from '../../../components/LocationInput';
  import { validateCity } from '../../../lib/cities';
  import { supabase } from '../../../lib/supabase';
  import toast from 'react-hot-toast';
  
  type SignUpModalProps = {
    onClose: () => void;
    onLoginClick: () => void;
  };
  
  export function SignUpModal({ onClose, onLoginClick }: SignUpModalProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      fullName: '',
      age: '',
      gender: '',
      location: '',
      bio: '',
      avatar: null as File | null,
      avatarPreview: '',
      selectedSkills: {} as Record<string, string>
    });
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
    const usernameRegex = /^[a-z0-9-_]+$/;

    // Password requirements
    const passwordRequirements = [
      { test: (p: string) => p.length >= 8, text: 'Mindestens 8 Zeichen' },
      //{ test: (p: string) => /[A-Z]/.test(p), text: 'Mindestens ein Großbuchstabe' },
      //{ test: (p: string) => /[a-z]/.test(p), text: 'Mindestens ein Kleinbuchstabe' },
      //{ test: (p: string) => /[0-9]/.test(p), text: 'Mindestens eine Zahl' },
    ];
  
    // Validation states for each step
    const [isStep1Valid, setIsStep1Valid] = useState(false);
    const [isStep2Valid, setIsStep2Valid] = useState(false);
    const [isStep3Valid, setIsStep3Valid] = useState(false);
  
    // Validate step 1
    useEffect(() => {
      const passwordValid = passwordRequirements.every(req => req.test(formData.password));
      const passwordsMatch = formData.password === formData.confirmPassword;
      
      setIsStep1Valid(
        Boolean(formData.email) && 
        Boolean(formData.username) && 
        passwordValid && 
        passwordsMatch && 
        isUsernameAvailable === true && 
        !isCheckingUsername
      );
    }, [formData.email, formData.username, formData.password, formData.confirmPassword, isUsernameAvailable, isCheckingUsername]);
  
    // Validate step 2
    useEffect(() => {
      setIsStep2Valid(
        Boolean(formData.fullName) && 
        Boolean(formData.location)
      );
    }, [formData.fullName, formData.location]);
  
    // Validate step 3
    useEffect(() => {
      const hasSelectedSkills = Object.keys(formData.selectedSkills).length > 0;
      const allSkillsHaveLevels = Object.values(formData.selectedSkills).every(level => Boolean(level));
      
      setIsStep3Valid(
        hasSelectedSkills && 
        allSkillsHaveLevels
      );
    }, [formData.selectedSkills]);
  
    const checkUsername = async (value: string) => {
      if (!value) {
        setIsUsernameAvailable(null);
        return;
      }
  
      setIsCheckingUsername(true);
      try {
        const isAvailable = await checkUsernameAvailability(value);
        setIsUsernameAvailable(isAvailable);
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setIsCheckingUsername(false);
      }
    };
  
    // Debounce username check
    React.useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (formData.username) {
          checkUsername(formData.username);
        }
      }, 500);
  
      return () => clearTimeout(timeoutId);
    }, [formData.username]);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwörter stimmen nicht überein');
        }
  
        // Check password requirements
        const failedRequirements = passwordRequirements.filter(req => !req.test(formData.password));
        if (failedRequirements.length > 0) {
          throw new Error(`Password muss: ${failedRequirements.map(r => r.text.toLowerCase()).join(', ')}`);
        }
  
        if (!isUsernameAvailable) {
          throw new Error('Benutzername ist bereits vergeben');
        }
  
        const skills = Object.entries(formData.selectedSkills).map(([skill, level]) => ({
          skill,
          experience_level: level
        }));
  
        const { user } = await signUp(
          formData.email,
          formData.password,
          formData.username,
          {
            full_name: formData.fullName,
            age: formData.age ? parseInt(formData.age) : null,
            gender: formData.gender,
            location: formData.location,
            bio: formData.bio,
            languages: ['DE']
          },
          skills
        );
  
        if (formData.avatar && user) {
          const avatarUrl = await uploadAvatar(formData.avatar, user.id);
          await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', user.id);
        }
  
        toast.success('Konto erfolgreich erstellt!');
        navigate('/profile');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
        setLoading(false);
      }
    };
  
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      setFormData(prev => ({
        ...prev,
        avatar: file,
        avatarPreview: URL.createObjectURL(file)
      }));
    };
  
    const renderStep = () => {
      switch (step) {
        case 1:
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="deine@email.de"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Dein Passwort"
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <div className="mt-2 space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-sm ${
                        req.test(formData.password) ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {req.test(formData.password) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      {req.text}
                    </div>
                  ))}
                </div>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort bestätigen
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Passwort wiederholen"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2 border ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-black focus:border-transparent`}
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    Passwörter stimmen nicht überein
                  </p>
                )}
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benutzername für peakly/profile/...
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="Wähle einen Benutzernamen"
                    value={formData.username}
                    onChange={(e) => {
                    
                      let username = e.target.value.replace(/\s+/g, '').toLowerCase();
                    // Remove any characters that are not allowed (anything other than lowercase letters, numbers, hyphens, or underscores)
                    username = username.replace(/[^a-z0-9-_]/g, ''); // This removes invalid characters
                    // Update the form data with the modified username
                    setFormData(prevData => ({
                      ...prevData,
                      username
                    }));
                
                    // Optionally, validate the username format (lowercase, no spaces, etc.)
                    if (/^[a-z0-9-_]+$/.test(username)) {
                      checkUsername(username);  // Check if the username is available
                    } else {
                      setIsUsernameAvailable(false);  // Immediately mark as unavailable
                    }
                  }}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                      isUsernameAvailable === true ? 'border-green-500' :
                      isUsernameAvailable === false ? 'border-red-500' :
                      'border-gray-300'
                    }`}
                  />
                  {formData.username && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {isCheckingUsername ? (
                        <div className="animate-spin text-gray-400">⌛</div>
                      ) : isUsernameAvailable ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : isUsernameAvailable === false ? (
                        <X className="w-5 h-5 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>
                {formData.username && !isCheckingUsername && (
                  <p className={`mt-1 text-sm ${
                    isUsernameAvailable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isUsernameAvailable
                      ? 'Benutzername ist verfügbar'
                      : 'Benutzername ist bereits vergeben'}
                  </p>
                )}
              </div>
            </div>
          );
  
        case 2:
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vollständiger Name*
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Vor- und Nachname"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standort*
                </label>
                <LocationInput
                  value={formData.location}
                  onChange={(value) => setFormData({ ...formData, location: value })}
                  className="border-gray-300"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alter
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="13"
                    max="120"
                    placeholder="Alter"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geschlecht
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Auswählen</option>
                    <option value="m">Männlich</option>
                    <option value="f">Weiblich</option>
                    <option value="d">Divers</option>
                  </select>
                </div>
              </div>
  
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Über dich
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  placeholder="Erzähle etwas über dich..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          );
  
        case 3:
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mb-4">
                  {formData.avatarPreview ? (
                    <img
                      src={formData.avatarPreview}
                      alt="Profilvorschau"
                      className="w-32 h-32 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                      <User className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>
                <label className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-900">
                  <Upload className="w-4 h-4" />
                  Profilbild hochladen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">Dein Profil ohne Bild ist doch langweilig...</p>
              </div>
  
              <div>
                <h3 className="font-medium mb-2">Wähle deine Skills aus</h3>
                {Object.keys(formData.selectedSkills).length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    Bitte wähle mindestens eine Fähigkeit aus
                  </p>
                )}

                {Object.keys(formData.selectedSkills).length > 0 && 
                 Object.values(formData.selectedSkills).some(level => !level) && (
                  <p className="text-sm text-amber-600 mt-2">
                    Bitte wähle noch ein Level aus
                  </p>
                )}
                
                <div className=" pr-2 mt-4">
                  {AVAILABLE_SKILLS.map((skill) => (
                    <div key={skill} className="mb-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={skill in formData.selectedSkills}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              selectedSkills: e.target.checked
                                ? { ...prev.selectedSkills, [skill]: '' }
                                : Object.fromEntries(
                                    Object.entries(prev.selectedSkills)
                                      .filter(([k]) => k !== skill)
                                  )
                            }));
                          }}
                          className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                        <span className="ml-2">{skill}</span>
                      </label>
                      {skill in formData.selectedSkills && (
                        <select
                          value={formData.selectedSkills[skill]}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              selectedSkills: {
                                ...prev.selectedSkills,
                                [skill]: e.target.value
                              }
                            }));
                          }}
                          className="mt-2 w-full px-4 py-2 border rounded-lg bg-white"
                          required={skill in formData.selectedSkills}
                        >
                          <option value="">Level wählen</option>
                          {SKILL_LEVELS[skill as keyof typeof SKILL_LEVELS]?.map((level) => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
                

                
              </div>
            </div>
          );
  
        default:
          return null;
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 py-8 z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative max-h-[85vh] flex flex-col">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <X className="w-6 h-6" />
          </button>
  
          <div className="px-6 pt-6 overflow-y-auto flex-1">
            <h2 className="text-2xl font-bold mb-6">Konto erstellen</h2>
  
            <div className="flex justify-between mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex items-center ${s !== 3 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      s <= step ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s}
                  </div>
                  {s !== 3 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        s < step ? 'bg-black' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
  
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStep()}
  
              <div className="flex gap-3 mt-4 sticky bottom-0 bg-white py-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Zurück
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                    className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Weiter
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !isStep3Valid}
                    className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Erstelle...' : 'Konto erstellen'}
                  </button>
                )}
              </div>
            </form>
  
            <div className="mt-4 mb-6 text-center text-sm text-gray-500">
              Hast du bereits ein Konto?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="text-black hover:underline"
              >
                Anmelden
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }