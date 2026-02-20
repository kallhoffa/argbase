import React, { useState } from 'react';

const About = () => {
  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const roadmap = {
    'Before Beta': [
      { id: 'search', title: 'Smart Search', description: 'Implement a smart search with natural language processing to find relevant arguments and counter-arguments.' },
      { id: 'hierarchical', title: 'Hierarchical Organization', description: 'Create a hierarchical organization of arguments to show logical relationships.' },
      { id: 'cross-referencing', title: 'Cross-Referencing', description: 'Enable cross-referencing between related topics.' },
    ],
    'Before Launch': [
      { id: 'strength-indicators', title: 'Strength Indicators', description: 'Develop strength indicators for evidence and arguments.' },
      { id: 'contribution', title: 'Community Contribution', description: 'Build a community contribution system for users to add and edit arguments.' },
      { id: 'mobile', title: 'Mobile-Friendly Interface', description: 'Ensure the interface is mobile-friendly.' },
    ],
    'Long-term': [
        { id: 'argument-mapping', title: 'Argument Mapping', description: 'Clear visualization of logical relationships between claims' },
        { id: 'evidence-library', title: 'Evidence Library', description: 'Curated collection of sources supporting established facts' },
        { id: 'quick-reference', title: 'Quick Reference', description: 'Easily accessible summaries of common arguments' },
        { id: 'citation-system', title: 'Citation System', description: 'Direct links to specific points and their supporting evidence' },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">About ArgBase</h1>
        <p className="mb-4">ArgBase is a knowledge platform designed to streamline access to established arguments and evidence. Our mission is to reduce the cognitive overhead of repeatedly reconstructing accepted truths in discussions and debates.</p>
        
        <h2 className="text-xl font-bold mb-4">Roadmap</h2>
        <p className="mb-4">This roadmap outlines our planned features and development timeline.</p>
        
        {Object.keys(roadmap).map((timeframe) => (
          <div key={timeframe} className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{timeframe}</h3>
            <div className="flex flex-wrap gap-2">
              {roadmap[timeframe].map((feature) => (
                <div key={feature.id} className="cursor-pointer" onClick={() => toggleExpand(feature.id)}>
                  <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-sm">{feature.title}</span>
                  {expanded === feature.id && (
                    <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                      <p>{feature.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;