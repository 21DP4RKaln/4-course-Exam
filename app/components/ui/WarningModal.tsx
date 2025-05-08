'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export const WarningModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(true);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-lg max-w-2xl w-full shadow-xl">
                <div className="absolute right-[-650px] bottom-[-320px]">
                    <Image 
                        src="/images/he.png" 
                        alt="Warning Icon" 
                        width={650} 
                        height={650}
                        className="object-contain"
                    />
                </div>
                <div className="absolute left-[10px] bottom-[5px]">
                    <Image 
                        src="/images/rvt.png" 
                        alt="RVT Logo" 
                        width={100} 
                        height={100}
                        className="object-contain"
                    />
                </div>
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">⚠️ Warning / Brīdinājums</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300 text-center">
                            This platform is a demonstration project and does not provide any real services at the moment. 
                            It was created for educational purposes only.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-center">
                            Šī platforma ir demonstrācijas projekts un šobrīd nesniedz nekādus reālus pakalpojumus. 
                            Tā ir izveidota tikai izglītības nolūkiem.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors self-center"
                    >
                        I Understand / Es Saprotu
                    </button>
                </div>
            </div>
        </div>
    );
};