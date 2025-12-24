import React from 'react';

interface PatientProfile {
  legal_full_name?: string;
  birth_date?: string;
  birth_time?: string;
  birth_city?: string;
  birth_country?: string;
  latitude?: number;
  longitude?: number;
  // Add other profile fields as needed
}

interface PatientProfileViewProps {
  profile: PatientProfile | null;
  onEdit?: () => void;
  canEdit?: boolean;
}

export default function PatientProfileView({ profile, onEdit, canEdit = true }: PatientProfileViewProps) {
  if (!profile) {
    return (
      <div className="text-sm text-gray-600">
        No profile data available.
      </div>
    );
  }

  const hasCoordinates = profile.latitude !== undefined && profile.longitude !== undefined;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Legal Full Name</label>
        <p className="mt-1 text-sm text-gray-900">{profile.legal_full_name || 'Not specified'}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Birth Date</label>
          <p className="mt-1 text-sm text-gray-900">{profile.birth_date || 'Not specified'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Birth Time</label>
          <p className="mt-1 text-sm text-gray-900">{profile.birth_time || 'Not specified'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Birth City</label>
          <p className="mt-1 text-sm text-gray-900">{profile.birth_city || 'Not specified'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Birth Country</label>
          <p className="mt-1 text-sm text-gray-900">{profile.birth_country || 'Not specified'}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Coordinates Status</label>
        <p className={`mt-1 text-sm ${hasCoordinates ? 'text-green-600' : 'text-red-600'}`}>
          {hasCoordinates ? 'Valid coordinates available' : 'Coordinates not set'}
        </p>
      </div>

      {canEdit && onEdit && (
        <div className="pt-4">
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}