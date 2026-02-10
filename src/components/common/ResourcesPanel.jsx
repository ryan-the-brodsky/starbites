import React from 'react';
import { X, FileText, Download, ExternalLink } from 'lucide-react';

const resources = [
  {
    id: 'trial-summary',
    name: 'Plant Trial Summary Format',
    description: 'Template structure for final reports',
    icon: '📝',
    type: 'template',
  },
  {
    id: 'ux-pyramid',
    name: 'UX Pyramid Template',
    description: 'Consumer needs assessment framework',
    icon: '🔺',
    type: 'template',
  },
  {
    id: 'dfmea',
    name: 'DFMEA Template',
    description: 'Design Failure Mode and Effects Analysis',
    icon: '⚠️',
    type: 'template',
  },
  {
    id: 'process-flow',
    name: 'Joy Bites Process Flow',
    description: 'Production process visualization',
    icon: '🔄',
    type: 'reference',
  },
  {
    id: 'ingredients',
    name: 'Ingredient Specifications',
    description: 'Joy Bites ingredient requirements',
    icon: '🧪',
    type: 'reference',
  },
  {
    id: 'packaging',
    name: 'Packaging Requirements',
    description: 'Packaging specs and standards',
    icon: '📦',
    type: 'reference',
  },
];

const ResourcesPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const templates = resources.filter(r => r.type === 'template');
  const references = resources.filter(r => r.type === 'reference');

  const handleDownload = (resource) => {
    // Placeholder - would trigger actual download in production
    alert(`Download: ${resource.name}\n\nNote: Document downloads will be available when content is provided.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Mission Resources</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Templates Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Templates
            </h3>
            <div className="space-y-3">
              {templates.map(resource => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </div>

          {/* Reference Materials Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Reference Materials
            </h3>
            <div className="space-y-3">
              {references.map(resource => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400">
              These resources are available throughout all mission levels.
              Download templates before starting if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourceCard = ({ resource, onDownload }) => (
  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
    <div className="flex items-start gap-3">
      <div className="text-2xl">{resource.icon}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{resource.name}</h4>
        <p className="text-sm text-slate-400 mt-1">{resource.description}</p>
      </div>
      <button
        onClick={() => onDownload(resource)}
        className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-medium transition-colors"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default ResourcesPanel;
