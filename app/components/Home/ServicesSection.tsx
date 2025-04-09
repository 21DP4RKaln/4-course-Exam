'use client'

import { Cpu, CheckCircle, Award, Headphones } from 'lucide-react'

const services = [
  {
    icon: <Cpu size={32} />,
    title: 'Custom PC Building',
    description: 'Create your dream PC with our easy-to-use configurator. Choose from premium components that match your needs and budget.'
  },
  {
    icon: <CheckCircle size={32} />,
    title: 'Expert Validation',
    description: 'Every configuration is reviewed by our specialists to ensure compatibility and optimal performance.'
  },
  {
    icon: <Award size={32} />,
    title: 'Premium Quality',
    description: 'We use only high-quality, tested components from trusted manufacturers with full warranty coverage.'
  },
  {
    icon: <Headphones size={32} />,
    title: '24/7 Support',
    description: 'Our expert team is available to help you with any questions or issues, before and after your purchase.'
  }
]

export default function ServicesSection() {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Why Choose IvaPro?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          We provide end-to-end service for all your PC needs, from configuration to delivery and support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-blue-600 dark:text-blue-400 mb-4">
              {service.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {service.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}