'use client';

import React, { useState } from 'react';
import { INDIAN_CITIES, INDIAN_STATES } from '@/lib/geoData';
import { MapPin, Search, CheckCircle2, XCircle, Building } from 'lucide-react';

export default function AdminCitiesPage() {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [cities, setCities] = useState(INDIAN_CITIES);

  const toggleCityActive = (id: number) => {
    setCities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isServed: !c.isServed } : c))
    );
  };

  const filtered = cities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.stateName.toLowerCase().includes(search.toLowerCase());
    const matchesState = selectedState === 'all' || c.stateSlug === selectedState;
    return matchesSearch && matchesState;
  });

  const activeCount = cities.filter((c) => c.isServed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-emerald-400" />
            <span>Metro Service Areas ({activeCount} Active)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure city-wise companion availability, coverage boundaries, and active market display.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="all">All 36 States & UTs</option>
            {INDIAN_STATES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="relative w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">City Name</th>
                <th className="py-3 px-4 font-semibold">State / UT</th>
                <th className="py-3 px-4 font-semibold">Tier</th>
                <th className="py-3 px-4 font-semibold">Current Status</th>
                <th className="py-3 px-4 font-semibold text-right">Toggle Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((city) => (
                <tr key={city.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-bold text-white">{city.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">/{city.slug}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {city.stateName}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    Tier {city.tier}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        city.isServed
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {city.isServed ? 'ACTIVELY SERVED' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleCityActive(city.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                        city.isServed
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                    >
                      {city.isServed ? 'Deactivate' : 'Activate Service'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
