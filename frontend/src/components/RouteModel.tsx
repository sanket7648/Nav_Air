import React from 'react';
import { X, PlayCircle } from 'lucide-react';

interface RouteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartTour: () => void; // New prop for starting the tour
    route: any[];
    iframeRef: React.RefObject<HTMLIFrameElement>;
}

export const RouteModal: React.FC<RouteModalProps> = ({ isOpen, onClose, onStartTour, route, iframeRef }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col p-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/70 rounded-full hover:bg-gray-200 transition-colors">
                    <X className="w-6 h-6 text-gray-800" />
                </button>

                <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                    <div className="w-full md:w-2/3 h-full rounded-lg overflow-hidden border border-gray-200">
                         <iframe
                            ref={iframeRef}
                            src="/AR Nav/index.html"
                            title="3D Airport Route Visualization"
                            className="w-full h-full border-0"
                        />
                    </div>

                    <div className="w-full md:w-1/3 h-full flex flex-col">
                        <h3 className="text-xl font-bold text-neutral-800 mb-4 px-2">Directions</h3>
                        <div className="flex-1 overflow-y-auto pr-2">
                             <ol className="relative border-l border-gray-200 ml-3">
                                {route.map((step, index) => (
                                    <li key={index} className="mb-8 ml-6">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                                            <span className="font-bold text-blue-800">{index + 1}</span>
                                        </span>
                                        <h4 className="text-md font-semibold text-gray-900">Proceed to {step.name}</h4>
                                        <p className="text-sm font-normal text-gray-500 capitalize">{step.type}</p>
                                    </li>
                                ))}
                             </ol>
                        </div>
                        {/* THE NEW "START" BUTTON */}
                        <div className="mt-4 p-2">
                            <button 
                                onClick={onStartTour}
                                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-600 transition-all text-lg"
                            >
                                <PlayCircle className="w-6 h-6" />
                                Start Navigation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};