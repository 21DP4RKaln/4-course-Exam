import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const getUserIdFromToken = () => {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(
      token.value,
      process.env.JWT_SECRET || '7f42e7c9b3d8a5f6e1b0c2d4a8f6e3b9d7c5a2f4e6b8d0c2a4f6e8b0d2c4a6f8'
    );
    return decoded.userId;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export async function GET() {
  try {

    const components = await prisma.component.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    if (components.length === 0) {
      return NextResponse.json(getDemoComponents());
    }
    
    return NextResponse.json(components);
  } catch (error) {
    console.error('Component fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}

function getDemoComponents() {
  return [
    { 
      id: 'cpu1', 
      category: 'CPU', 
      name: 'Intel Core i3-12100F', 
      manufacturer: 'Intel', 
      price: 109.99, 
      specs: { cores: 4, threads: 8, frequency: '3.3GHz', turboFrequency: '4.3GHz', socket: 'LGA1700' },
      stock: 15
    },
    { 
      id: 'cpu2', 
      category: 'CPU', 
      name: 'Intel Core i5-13400F', 
      manufacturer: 'Intel', 
      price: 229.99, 
      specs: { cores: 10, threads: 16, frequency: '2.5GHz', turboFrequency: '4.6GHz', socket: 'LGA1700' },
      stock: 8
    },
    { 
      id: 'cpu3', 
      category: 'CPU', 
      name: 'Intel Core i7-13700K', 
      manufacturer: 'Intel', 
      price: 419.99, 
      specs: { cores: 16, threads: 24, frequency: '3.4GHz', turboFrequency: '5.4GHz', socket: 'LGA1700' },
      stock: 4
    },
    { 
      id: 'cpu4', 
      category: 'CPU', 
      name: 'AMD Ryzen 5 7600X', 
      manufacturer: 'AMD', 
      price: 299.99, 
      specs: { cores: 6, threads: 12, frequency: '4.7GHz', turboFrequency: '5.3GHz', socket: 'AM5' },
      stock: 10
    },
    { 
      id: 'cpu5', 
      category: 'CPU', 
      name: 'AMD Ryzen 7 7800X3D', 
      manufacturer: 'AMD', 
      price: 449.99, 
      specs: { cores: 8, threads: 16, frequency: '4.2GHz', turboFrequency: '5.0GHz', socket: 'AM5', cache: '96MB' },
      stock: 3
    },

    { 
      id: 'gpu1', 
      category: 'GPU', 
      name: 'NVIDIA GeForce RTX 4060', 
      manufacturer: 'NVIDIA', 
      price: 299.99, 
      specs: { memory: '8GB GDDR6', cores: 3072, boost: '2.46GHz', interface: 'PCIe 4.0' },
      stock: 7
    },
    { 
      id: 'gpu2', 
      category: 'GPU', 
      name: 'NVIDIA GeForce RTX 4070', 
      manufacturer: 'NVIDIA', 
      price: 599.99, 
      specs: { memory: '12GB GDDR6X', cores: 5888, boost: '2.61GHz', interface: 'PCIe 4.0' },
      stock: 5
    },
    { 
      id: 'gpu3', 
      category: 'GPU', 
      name: 'NVIDIA GeForce RTX 4080', 
      manufacturer: 'NVIDIA', 
      price: 1199.99, 
      specs: { memory: '16GB GDDR6X', cores: 9728, boost: '2.51GHz', interface: 'PCIe 4.0' },
      stock: 2
    },
    { 
      id: 'gpu4', 
      category: 'GPU', 
      name: 'AMD Radeon RX 7600', 
      manufacturer: 'AMD', 
      price: 269.99, 
      specs: { memory: '8GB GDDR6', cores: 2048, boost: '2.65GHz', interface: 'PCIe 4.0' },
      stock: 9
    },
    { 
      id: 'gpu5', 
      category: 'GPU', 
      name: 'AMD Radeon RX 7800 XT', 
      manufacturer: 'AMD', 
      price: 499.99, 
      specs: { memory: '16GB GDDR6', cores: 3840, boost: '2.43GHz', interface: 'PCIe 4.0' },
      stock: 4
    },

    { 
      id: 'ram1', 
      category: 'RAM', 
      name: 'Corsair Vengeance DDR4 (2x8GB)', 
      manufacturer: 'Corsair', 
      price: 69.99, 
      specs: { capacity: '16GB', speed: '3200MHz', type: 'DDR4', cas: 'CL16' },
      stock: 20
    },
    { 
      id: 'ram2', 
      category: 'RAM', 
      name: 'G.Skill Trident Z RGB DDR4 (2x16GB)', 
      manufacturer: 'G.Skill', 
      price: 129.99, 
      specs: { capacity: '32GB', speed: '3600MHz', type: 'DDR4', cas: 'CL16' },
      stock: 12
    },
    { 
      id: 'ram3', 
      category: 'RAM', 
      name: 'Kingston FURY Beast DDR5 (2x16GB)', 
      manufacturer: 'Kingston', 
      price: 159.99, 
      specs: { capacity: '32GB', speed: '5600MHz', type: 'DDR5', cas: 'CL40' },
      stock: 8
    },

    { 
      id: 'ssd1', 
      category: 'SSD', 
      name: 'Samsung 970 EVO Plus', 
      manufacturer: 'Samsung', 
      price: 89.99, 
      specs: { capacity: '1TB', interface: 'NVMe PCIe 3.0', read: '3500MB/s', write: '3300MB/s' },
      stock: 15
    },
    { 
      id: 'ssd2', 
      category: 'SSD', 
      name: 'WD Black SN850X', 
      manufacturer: 'Western Digital', 
      price: 149.99, 
      specs: { capacity: '2TB', interface: 'NVMe PCIe 4.0', read: '7300MB/s', write: '6600MB/s' },
      stock: 7
    },
    { 
      id: 'ssd3', 
      category: 'SSD', 
      name: 'Crucial MX500', 
      manufacturer: 'Crucial', 
      price: 69.99, 
      specs: { capacity: '1TB', interface: 'SATA III', read: '560MB/s', write: '510MB/s' },
      stock: 11
    },

    { 
      id: 'psu1', 
      category: 'PSU', 
      name: 'Corsair RM750x', 
      manufacturer: 'Corsair', 
      price: 129.99, 
      specs: { power: '750W', efficiency: '80+ Gold', modular: 'Full', warranty: '10 years' },
      stock: 9
    },
    { 
      id: 'psu2', 
      category: 'PSU', 
      name: 'EVGA SuperNOVA 850 G5', 
      manufacturer: 'EVGA', 
      price: 149.99, 
      specs: { power: '850W', efficiency: '80+ Gold', modular: 'Full', warranty: '10 years' },
      stock: 6
    },
    { 
      id: 'psu3', 
      category: 'PSU', 
      name: 'be quiet! Straight Power 11', 
      manufacturer: 'be quiet!', 
      price: 169.99, 
      specs: { power: '1000W', efficiency: '80+ Platinum', modular: 'Full', warranty: '5 years' },
      stock: 4
    },

    { 
      id: 'case1', 
      category: 'Case', 
      name: 'NZXT H510', 
      manufacturer: 'NZXT', 
      price: 89.99, 
      specs: { size: 'Mid Tower', formFactor: 'ATX, mATX, ITX', color: 'Black/Red' },
      stock: 8
    },
    { 
      id: 'case2', 
      category: 'Case', 
      name: 'Corsair 4000D Airflow', 
      manufacturer: 'Corsair', 
      price: 104.99, 
      specs: { size: 'Mid Tower', formFactor: 'ATX, mATX, ITX', color: 'Black' },
      stock: 11
    },
    { 
      id: 'case3', 
      category: 'Case', 
      name: 'Lian Li O11 Dynamic', 
      manufacturer: 'Lian Li', 
      price: 149.99, 
      specs: { size: 'Mid Tower', formFactor: 'ATX, mATX, ITX', color: 'White' },
      stock: 5
    },

    { 
      id: 'cool1', 
      category: 'CPU Cooling', 
      name: 'Noctua NH-D15', 
      manufacturer: 'Noctua', 
      price: 99.99, 
      specs: { type: 'Air', fans: 2, height: '165mm', socket: 'Intel & AMD' },
      stock: 6
    },
    { 
      id: 'cool2', 
      category: 'CPU Cooling', 
      name: 'Corsair iCUE H100i RGB PRO XT', 
      manufacturer: 'Corsair', 
      price: 129.99, 
      specs: { type: 'Liquid', radiator: '240mm', fans: 2, socket: 'Intel & AMD' },
      stock: 9
    },
    { 
      id: 'cool3', 
      category: 'CPU Cooling', 
      name: 'ARCTIC Liquid Freezer II 360', 
      manufacturer: 'ARCTIC', 
      price: 149.99, 
      specs: { type: 'Liquid', radiator: '360mm', fans: 3, socket: 'Intel & AMD' },
      stock: 4
    }
  ];
}