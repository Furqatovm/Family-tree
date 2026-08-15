import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import {
  Select,
  Input,
  Modal as AntModal,
  message as antMessage,
  Badge as AntBadge,
  Button as AntButton,
  Tooltip as AntTooltip,
  Tag as AntTag
} from 'antd';
import {
  MapPin,
  Navigation,
  Search,
  RefreshCw,
  Compass,
  Play,
  Square,
  History,
  Edit3,
  Layers,
  Sparkles,
  Move
} from 'lucide-react';
import { familyApi } from '../api/familyApi';
import { personApi, LocationPayload } from '../api/personApi';
import { Family, Person, LocationHistoryItem } from '../types';
import { Button } from '../components/ui/Button';

const { Option } = Select;
const { Search: AntSearch } = Input;

export const FamilyMapPage: React.FC = () => {
  const { familyId } = useParams<{ familyId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  // States
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(
    familyId ? parseInt(familyId, 10) : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Form states for location update modal
  const [updateLat, setUpdateLat] = useState<string>('');
  const [updateLng, setUpdateLng] = useState<string>('');
  const [updateLocName, setUpdateLocName] = useState<string>('');
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [targetPersonId, setTargetPersonId] = useState<number | null>(null);

  // Location suggestions search state
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLocNameChange = (val: string) => {
    setUpdateLocName(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!val || val.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      setIsSearchingLoc(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val.trim())}&limit=5`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setLocationSuggestions(data);
          }
        })
        .catch((err) => console.warn('Nominatim search error:', err))
        .finally(() => setIsSearchingLoc(false));
    }, 300);
  };

  const handleSelectLocationSuggestion = (item: { display_name: string; lat: string; lon: string }) => {
    const parts = item.display_name.split(',');
    const shortName = parts.slice(0, 3).join(',').trim();
    setUpdateLocName(shortName);
    setUpdateLat(parseFloat(item.lat).toFixed(6));
    setUpdateLng(parseFloat(item.lon).toFixed(6));
    setLocationSuggestions([]);
    antMessage.info(`📍 Joylashuv va koordinata avtomatik tanlandi: ${shortName}`);
  };

  // History state
  const [showHistoryForPersonId, setShowHistoryForPersonId] = useState<number | null>(null);
  const [historyTrail, setHistoryTrail] = useState<LocationHistoryItem[]>([]);

  // Fetch all user's families
  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: familyApi.getFamilies,
  });

  // Set default family if none selected
  useEffect(() => {
    if (!selectedFamilyId && families.length > 0) {
      setSelectedFamilyId(families[0].id);
    }
  }, [families, selectedFamilyId]);

  // Fetch people in selected family
  const {
    data: people = [],
    isLoading: isLoadingPeople,
    refetch: refetchPeople,
  } = useQuery({
    queryKey: ['family-people-locations', selectedFamilyId],
    queryFn: () => (selectedFamilyId ? personApi.getPeopleByFamily(selectedFamilyId) : []),
    enabled: !!selectedFamilyId,
    refetchInterval: isSimulating ? 3000 : false,
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: ({ personId, payload }: { personId: number; payload: LocationPayload }) =>
      personApi.updateLocation(personId, payload),
    onSuccess: (updatedPerson) => {
      queryClient.invalidateQueries({ queryKey: ['family-people-locations', selectedFamilyId] });
      queryClient.invalidateQueries({ queryKey: ['person', updatedPerson.id] });
      setIsUpdateModalOpen(false);
      antMessage.success(`${updatedPerson.first_name} joylashuvi saqlandi!`);
      if (selectedPerson?.id === updatedPerson.id) {
        setSelectedPerson(updatedPerson);
      }
    },
    onError: () => {
      antMessage.error('Joylashuvni saqlashda xatolik yuz berdi');
    }
  });

  // Fetch location history for selected member
  useEffect(() => {
    if (!showHistoryForPersonId) {
      setHistoryTrail([]);
      if (polylineRef.current && mapRef.current) {
        mapRef.current.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      return;
    }

    personApi.getLocationHistory(showHistoryForPersonId).then((trail) => {
      setHistoryTrail(trail);
    });
  }, [showHistoryForPersonId]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const defaultCenter: L.LatLngTuple = [41.31108, 69.2797];
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(defaultCenter, 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Click map to select coordinates
    map.on('click', (e: L.LeafletMouseEvent) => {
      setUpdateLat(e.latlng.lat.toFixed(6));
      setUpdateLng(e.latlng.lng.toFixed(6));
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers on Map with DRAGGABLE functionality & Auto-save on dragend!
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const bounds: L.LatLngTuple[] = [];

    people.forEach((person) => {
      if (person.current_lat != null && person.current_lng != null) {
        const lat = person.current_lat;
        const lng = person.current_lng;
        bounds.push([lat, lng]);

        const avatarUrl =
          person.photo_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            person.first_name + ' ' + person.last_name
          )}&background=3F6B4F&color=fff`;

        const isSelected = selectedPerson?.id === person.id;

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div class="custom-marker-pin ${isSelected ? 'active' : ''}">
              <div class="custom-marker-img-wrapper">
                <img src="${avatarUrl}" alt="${person.first_name}" />
              </div>
              <div class="custom-marker-badge pulse"></div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; padding: 4px 6px; min-width: 190px;">
            <div style="display: flex; items-center; gap: 8px; margin-bottom: 6px;">
              <img src="${avatarUrl}" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover;" />
              <div>
                <strong style="font-size: 14px; color: #1C1917;">${person.first_name} ${person.last_name}</strong>
                <span style="display: block; font-size: 11px; color: #78716C;">${person.occupation || 'Family Member'}</span>
              </div>
            </div>
            ${person.status_message ? `<p style="font-size: 12px; color: #3F6B4F; font-weight: 500; margin: 4px 0;">💬 "${person.status_message}"</p>` : ''}
            ${person.current_location_name ? `<p style="font-size: 11px; color: #57534E; margin: 2px 0;">📍 ${person.current_location_name}</p>` : ''}
            <p style="font-size: 10px; color: #2563EB; font-weight: 600; margin-top: 4px;">🖐️ Drag card anywhere to move & auto-save position</p>
            <div style="margin-top: 8px; display: flex; gap: 4px;">
              <button id="btn-select-${person.id}" style="background: #3F6B4F; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; flex: 1;">View Profile</button>
            </div>
          </div>
        `;

        // Make marker DRAGGABLE!
        const marker = L.marker([lat, lng], {
          icon: customIcon,
          draggable: true,
          title: `Drag ${person.first_name} to move position`
        }).addTo(map);

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          setSelectedPerson(person);
        });

        // DRAG END AUTO-SAVE EVENT!
        marker.on('dragend', async (e: L.DragEndEvent) => {
          const newPos = e.target.getLatLng();
          const newLat = parseFloat(newPos.lat.toFixed(6));
          const newLng = parseFloat(newPos.lng.toFixed(6));

          let resolvedPlace = 'Custom Position';

          // Reverse geocode using OpenStreetMap Nominatim
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData && geoData.display_name) {
                const parts = geoData.display_name.split(',');
                resolvedPlace = parts.slice(0, 3).join(',').trim();
              }
            }
          } catch (err) {
            console.warn('Geocoding error:', err);
          }

          // Auto-save new position to backend database
          try {
            const updated = await personApi.updateLocation(person.id, {
              latitude: newLat,
              longitude: newLng,
              location_name: resolvedPlace,
              status_message: person.status_message || 'Moved card on map'
            });

            antMessage.success({
              content: `${person.first_name} ${person.last_name} joylashuvi avtomatik saqlandi! 📍 (${resolvedPlace})`,
              duration: 4,
            });

            queryClient.invalidateQueries({ queryKey: ['family-people-locations', selectedFamilyId] });
            if (selectedPerson?.id === person.id) {
              setSelectedPerson(updated);
            }
          } catch (err) {
            antMessage.error('Joylashuvni saqlashda xatolik yuz berdi.');
          }
        });

        marker.on('popupopen', () => {
          setTimeout(() => {
            const btn = document.getElementById(`btn-select-${person.id}`);
            if (btn) {
              btn.onclick = () => {
                navigate(`/people/${person.id}`);
              };
            }
          }, 100);
        });

        markersRef.current[person.id] = marker;
      }
    });

    // Auto fit bounds if markers exist and no manual fit done yet
    if (bounds.length > 0 && !selectedPerson) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [people, selectedPerson, navigate, selectedFamilyId, queryClient]);

  // Update Polyline for History Trail
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (historyTrail.length > 0) {
      const coords: L.LatLngTuple[] = historyTrail.map((item) => [item.latitude, item.longitude]);
      const polyline = L.polyline(coords, {
        color: '#2563EB',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(map);

      polylineRef.current = polyline;
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [historyTrail]);

  // Live simulation movement effect
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const validPeople = people.filter((p) => p.current_lat != null && p.current_lng != null);
      if (validPeople.length === 0) return;

      const randomPerson = validPeople[Math.floor(Math.random() * validPeople.length)];
      const deltaLat = (Math.random() - 0.5) * 0.003;
      const deltaLng = (Math.random() - 0.5) * 0.003;

      const newLat = (randomPerson.current_lat! + deltaLat).toFixed(6);
      const newLng = (randomPerson.current_lng! + deltaLng).toFixed(6);

      personApi.updateLocation(randomPerson.id, {
        latitude: parseFloat(newLat),
        longitude: parseFloat(newLng),
        location_name: randomPerson.current_location_name || 'In motion',
        status_message: `Live moving... (${new Date().toLocaleTimeString()})`,
      }).then(() => {
        refetchPeople();
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulating, people, refetchPeople]);

  // Handler to center map on person
  const handleFocusPerson = (person: Person) => {
    setSelectedPerson(person);
    if (mapRef.current && person.current_lat != null && person.current_lng != null) {
      mapRef.current.flyTo([person.current_lat, person.current_lng], 15, {
        duration: 1.2,
      });
      const marker = markersRef.current[person.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  // Handler to open update modal
  const handleOpenUpdateModal = (person: Person) => {
    setTargetPersonId(person.id);
    setUpdateLat(person.current_lat != null ? person.current_lat.toString() : '41.31108');
    setUpdateLng(person.current_lng != null ? person.current_lng.toString() : '69.2797');
    setUpdateLocName(person.current_location_name || '');
    setUpdateStatus(person.status_message || '');
    setIsUpdateModalOpen(true);
  };

  // Handler to use browser Geolocation API
  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setIsGeocoding(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          setUpdateLat(lat);
          setUpdateLng(lng);

          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData && geoData.display_name) {
                const parts = geoData.display_name.split(',');
                setUpdateLocName(parts.slice(0, 3).join(',').trim());
              }
            }
          } catch (err) {
            setUpdateLocName('My Live GPS Location');
          } finally {
            setIsGeocoding(false);
          }
        },
        (err) => {
          setIsGeocoding(false);
          antMessage.error('GPS joylashuvni aniqlab bo\'lmadi: ' + err.message);
        }
      );
    } else {
      antMessage.error('Brauzeringiz Geolocation funksiyasini qo\'llab-quvvatlamaydi.');
    }
  };

  // Submit manual location update
  const handleSubmitLocationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPersonId || !updateLat || !updateLng) return;

    updateLocationMutation.mutate({
      personId: targetPersonId,
      payload: {
        latitude: parseFloat(updateLat),
        longitude: parseFloat(updateLng),
        location_name: updateLocName.trim() || undefined,
        status_message: updateStatus.trim() || undefined,
      },
    });
  };

  // Fit all markers button
  const handleFitAll = () => {
    const map = mapRef.current;
    if (!map) return;
    const bounds: L.LatLngTuple[] = people
      .filter((p) => p.current_lat != null && p.current_lng != null)
      .map((p) => [p.current_lat!, p.current_lng!]);

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Filtered members by search
  const filteredPeople = people.filter((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    const locName = (p.current_location_name || '').toLowerCase();
    const status = (p.status_message || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || locName.includes(query) || status.includes(query);
  });

  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto h-full flex flex-col sm:flex-row px-4 sm:px-8 py-3 gap-4">
        {/* Sidebar Panel */}
        <div className="w-full sm:w-80 md:w-96 bg-white border border-[#E7E5E4] rounded-2xl flex flex-col z-20 shadow-card flex-shrink-0 max-h-[40vh] sm:max-h-none overflow-hidden">
        {/* Header with Ant Design Select & Search */}
        <div className="p-4 sm:p-5 border-b border-[#E7E5E4] space-y-3 bg-[#FAFAF9]/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3F6B4F]/10 text-[#3F6B4F] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h1 className="font-serif text-xl font-bold text-[#1C1917]">Oila Xaritasi</h1>
            </div>

            {/* Ant Design Select for Family */}
            {families.length > 0 && (
              <Select
                value={selectedFamilyId || undefined}
                onChange={(val: number) => setSelectedFamilyId(val)}
                className="w-36 text-xs"
                placeholder="Tanlang"
              >
                {families.map((fam: Family) => (
                  <Option key={fam.id} value={fam.id}>
                    {fam.name}
                  </Option>
                ))}
              </Select>
            )}
          </div>

          {/* Ant Design Input.Search for member filtering */}
          <AntSearch
            placeholder="A'zoni yoki manzilni qidirish..."
            allowClear
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          {/* Live Action Toggles */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              variant={isSimulating ? 'primary' : 'outline'}
              size="sm"
              className="flex-1 text-xs"
              leftIcon={isSimulating ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5" />}
              onClick={() => setIsSimulating(!isSimulating)}
            >
              {isSimulating ? 'Live Demo To\'xtatish' : 'Live Movement Demo'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchPeople()}
              title="Refresh Locations"
            >
              <RefreshCw className="w-4 h-4 text-[#78716C]" />
            </Button>
          </div>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoadingPeople ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredPeople.length > 0 ? (
            filteredPeople.map((person) => {
              const isSelected = selectedPerson?.id === person.id;
              const hasLocation = person.current_lat != null && person.current_lng != null;

              return (
                <div
                  key={person.id}
                  onClick={() => handleFocusPerson(person)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#3F6B4F] bg-[#3F6B4F]/5 shadow-subtle'
                      : 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1] hover:bg-[#FAFAF9]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          person.photo_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            person.first_name + ' ' + person.last_name
                          )}&background=3F6B4F&color=fff`
                        }
                        alt={person.first_name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-[#1C1917] truncate">
                          {person.first_name} {person.last_name}
                        </h4>
                        {hasLocation && (
                          <AntTag color="success" className="m-0 text-[10px]">
                            Faol
                          </AntTag>
                        )}
                      </div>

                      <p className="text-xs text-[#78716C] truncate mt-0.5">
                        {person.occupation || 'Family Member'}
                      </p>

                      {person.status_message && (
                        <p className="text-xs text-[#3F6B4F] font-medium mt-1 truncate">
                          💬 {person.status_message}
                        </p>
                      )}

                      {person.current_location_name ? (
                        <p className="text-[11px] text-[#78716C] mt-1 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-[#A67C52] flex-shrink-0" />
                          <span className="truncate">{person.current_location_name}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#A8A29E] italic mt-1">No location set</p>
                      )}
                    </div>
                  </div>

                  {/* Actions inside member card */}
                  <div className="mt-3 pt-2.5 border-t border-[#E7E5E4] flex items-center justify-between text-xs text-[#78716C]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenUpdateModal(person);
                      }}
                      className="flex items-center gap-1 text-[#3F6B4F] hover:underline font-medium"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Set Location
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (showHistoryForPersonId === person.id) {
                          setShowHistoryForPersonId(null);
                        } else {
                          setShowHistoryForPersonId(person.id);
                        }
                      }}
                      className={`flex items-center gap-1 font-medium transition-colors ${
                        showHistoryForPersonId === person.id ? 'text-blue-600 font-semibold' : 'hover:text-[#1C1917]'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      {showHistoryForPersonId === person.id ? 'Hide Trail' : 'History Trail'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-[#78716C] text-sm">
              <p>Qidiruv bo'yicha hech qanday a'zo topilmadi.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Map View */}
      <div className="flex-1 relative h-full w-full">
        {/* Leaflet Map Container */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Top Info Banner */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-white/95 backdrop-blur-md p-2 px-4 rounded-2xl border border-[#E7E5E4] shadow-card">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#3F6B4F]" />
            <span className="font-serif font-bold text-sm text-[#1C1917]">
              {selectedFamilyId ? families.find((f) => f.id === selectedFamilyId)?.name : 'Oila Xaritasi'}
            </span>
          </div>

          <div className="h-4 w-px bg-[#E7E5E4]" />

          <AntTooltip title="Kartalarni xarita ustida istalgan joyga sudrab o'tkazing (Drag & Drop), yangi joylashuv va manzil avtomatik saqlanadi!">
            <span className="text-xs text-blue-600 font-medium flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-md">
              <Move className="w-3.5 h-3.5" /> Drag & Drop Auto-Save
            </span>
          </AntTooltip>

          <div className="h-4 w-px bg-[#E7E5E4]" />

          <button
            onClick={handleFitAll}
            className="text-xs font-semibold text-[#3F6B4F] hover:text-[#345A42] flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" />
            Fit All Members
          </button>
        </div>

        {/* Selected Member Detail Floating Card */}
        {selectedPerson && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-20 bg-white/95 backdrop-blur-md rounded-3xl border border-[#E7E5E4] p-5 shadow-card space-y-3 transition-all animate-fadeIn">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedPerson.photo_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedPerson.first_name + ' ' + selectedPerson.last_name
                    )}&background=3F6B4F&color=fff`
                  }
                  alt={selectedPerson.first_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#3F6B4F]"
                />
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                    {selectedPerson.first_name} {selectedPerson.last_name}
                  </h3>
                  <p className="text-xs text-[#78716C]">{selectedPerson.occupation || 'Family Member'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                className="text-[#78716C] hover:text-[#1C1917] p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {selectedPerson.status_message && (
              <div className="bg-[#3F6B4F]/10 p-2.5 rounded-xl text-xs text-[#3F6B4F] font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>"{selectedPerson.status_message}"</span>
              </div>
            )}

            <div className="space-y-1 text-xs text-[#57534E]">
              {selectedPerson.current_location_name && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#3F6B4F]" />
                  <span className="font-semibold text-[#1C1917]">{selectedPerson.current_location_name}</span>
                </p>
              )}
              {selectedPerson.current_lat != null && selectedPerson.current_lng != null && (
                <p className="flex items-center gap-1.5 text-[#78716C] font-mono text-[11px]">
                  <Navigation className="w-3.5 h-3.5" />
                  GPS: {selectedPerson.current_lat.toFixed(5)}, {selectedPerson.current_lng.toFixed(5)}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#E7E5E4]">
              <Button
                variant="primary"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => navigate(`/people/${selectedPerson.id}`)}
              >
                View Full Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                onClick={() => handleOpenUpdateModal(selectedPerson)}
              >
                Update
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Ant Design Modal: Update Location */}
      <AntModal
        open={isUpdateModalOpen}
        onCancel={() => setIsUpdateModalOpen(false)}
        title="Oila a'zosi joylashuvini yangilash"
        footer={null}
      >
        <form onSubmit={handleSubmitLocationUpdate} className="space-y-4 pt-2">
          <div className="flex items-center justify-between bg-[#FAFAF9] p-3 rounded-xl border border-[#E7E5E4]">
            <span className="text-xs font-semibold text-[#1C1917]">Qurilma GPS joylashuvi</span>
            <AntButton
              type="default"
              size="small"
              icon={<Navigation className="w-3.5 h-3.5 text-blue-600 inline mr-1" />}
              loading={isGeocoding}
              onClick={handleUseCurrentLocation}
            >
              Mening GPS manzilim
            </AntButton>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#78716C] mb-1">Kenglik (Latitude) *</label>
              <Input
                type="number"
                step="any"
                placeholder="41.31108"
                value={updateLat}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpdateLat(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#78716C] mb-1">Uzunlik (Longitude) *</label>
              <Input
                type="number"
                step="any"
                placeholder="69.2797"
                value={updateLng}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpdateLng(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-[#78716C] mb-1 flex items-center justify-between">
              <span>Joy / Manzil nomi</span>
              <span className="text-[10px] text-blue-600 font-normal">🔍 Qidiring va tanlang (Auto-Fill GPS)</span>
            </label>
            <Input
              placeholder="Chilonzor / Tashkent City / Samarkand Darvoza"
              value={updateLocName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLocNameChange(e.target.value)}
              suffix={
                isSearchingLoc ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3F6B4F]" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-[#78716C]" />
                )
              }
            />

            {/* Suggestions Dropdown List */}
            {locationSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E7E5E4] rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto animate-fadeIn">
                <div className="p-2 bg-[#FAFAF9] text-[10px] uppercase font-bold text-[#78716C] border-b border-[#E7E5E4] flex items-center justify-between">
                  <span>Tavsiya etilgan manzillar ({locationSuggestions.length})</span>
                  <button
                    type="button"
                    onClick={() => setLocationSuggestions([])}
                    className="text-stone-400 hover:text-stone-700 font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
                {locationSuggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectLocationSuggestion(item)}
                    className="p-3 hover:bg-[#3F6B4F]/10 cursor-pointer border-b border-stone-100 last:border-none transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#3F6B4F] flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-[#1C1917] truncate">
                        {item.display_name.split(',').slice(0, 3).join(',').trim()}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#78716C] truncate mt-0.5 pl-5">{item.display_name}</p>
                    <p className="text-[9px] text-[#3F6B4F] font-mono mt-0.5 pl-5">
                      📍 Lat: {parseFloat(item.lat).toFixed(5)}, Lng: {parseFloat(item.lon).toFixed(5)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#78716C] mb-1">Holat xabari / Mashg'ulot</label>
            <Input
              placeholder="Ishda 💼 / Qahva ichmoqda ☕"
              value={updateStatus}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpdateStatus(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5E4]">
            <AntButton onClick={() => setIsUpdateModalOpen(false)}>
              Bekor qilish
            </AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              loading={updateLocationMutation.isPending}
              style={{ backgroundColor: '#3F6B4F', borderColor: '#3F6B4F' }}
            >
              Saqlash
            </AntButton>
          </div>
        </form>
      </AntModal>
    </div>
  </div>
  );
};
