import { PrismaClient } from '@prisma/client';
import { priceWith99 } from './utils';

export async function seedPeripherals(prisma: PrismaClient): Promise<void> {
  // Get category IDs
  const categories = await prisma.peripheralCategory.findMany();
  const keyboardCategory = categories.find(c => c.slug === 'keyboard')!;
  const mouseCategory = categories.find(c => c.slug === 'mouse')!;
  const mousePadCategory = categories.find(c => c.slug === 'mousepad')!;
  const microphoneCategory = categories.find(c => c.slug === 'microphone')!;
  const cameraCategory = categories.find(c => c.slug === 'camera')!;
  const monitorCategory = categories.find(c => c.slug === 'monitor')!;
  const headphonesCategory = categories.find(c => c.slug === 'headphones')!;
  const speakersCategory = categories.find(c => c.slug === 'speakers')!;
  const gamepadCategory = categories.find(c => c.slug === 'gamepad')!;

  // Keyboard Peripherals
  const keyboardPeripherals = [
    {
      name: 'Logitech G Pro X Mechanical Gaming Keyboard',
      description:
        'Professional mechanical keyboard with hot-swappable switches',
      price: priceWith99(120, 160),
      quantity: 25,
      imagesUrl: '/products/peripherals/keyboards1.jpg',
      sku: 'KB-LOGITECH-GPROX',
      subType: 'mechanical',
      categoryId: keyboardCategory.id,
      keyboard: {
        brand: 'Logitech',
        switchType: 'GX Blue',
        layout: 'US',
        form: 'TKL',
        connection: 'USB-C',
        rgb: true,
        numpad: false,
      },
    },
    {
      name: 'Corsair K95 RGB Platinum XT',
      description:
        'Premium mechanical keyboard with macro keys and media controls',
      price: priceWith99(180, 220),
      quantity: 20,
      imagesUrl: '/products/peripherals/keyboards2.jpg',
      sku: 'KB-CORSAIR-K95PLAT',
      subType: 'mechanical',
      categoryId: keyboardCategory.id,
      keyboard: {
        brand: 'Corsair',
        switchType: 'Cherry MX Speed',
        layout: 'US',
        form: 'Full Size',
        connection: 'USB',
        rgb: true,
        numpad: true,
      },
    },
    {
      name: 'Razer Huntsman V3 Pro',
      description:
        'Ultra-fast optical mechanical keyboard for competitive gaming',
      price: priceWith99(200, 250),
      quantity: 18,
      imagesUrl: '/products/peripherals/keyboards3.jpg',
      sku: 'KB-RAZER-HUNTSMANV3',
      subType: 'optical',
      categoryId: keyboardCategory.id,
      keyboard: {
        brand: 'Razer',
        switchType: 'Razer Optical',
        layout: 'US',
        form: 'TKL',
        connection: 'USB-C',
        rgb: true,
        numpad: false,
      },
    },
  ];

  // Mouse Peripherals
  const mousePeripherals = [
    {
      name: 'Logitech G Pro X Superlight',
      description: 'Ultra-lightweight wireless gaming mouse',
      price: priceWith99(120, 160),
      quantity: 30,
      imagesUrl: '/products/peripherals/mice1.jpg',
      sku: 'MOUSE-LOGITECH-GPROX',
      subType: 'wireless',
      categoryId: mouseCategory.id,
      mouse: {
        brand: 'Logitech',
        color: 'Black',
        category: 'Gaming',
        dpi: 25600,
        buttons: 5,
        connection: 'Wireless',
        rgb: false,
        weight: 63.0,
        sensor: 'HERO 25K',
        batteryType: 'Built-in',
        batteryLife: 70,
      },
    },
    {
      name: 'Razer DeathAdder V3 Pro',
      description: 'Ergonomic wireless gaming mouse with focus+ technology',
      price: priceWith99(130, 170),
      quantity: 25,
      imagesUrl: '/products/peripherals/mice2.jpg',
      sku: 'MOUSE-RAZER-DAV3PRO',
      subType: 'wireless',
      categoryId: mouseCategory.id,
      mouse: {
        brand: 'Razer',
        color: 'Black',
        category: 'Gaming',
        dpi: 30000,
        buttons: 8,
        connection: 'Wireless',
        rgb: true,
        weight: 88.0,
        sensor: 'Focus Pro 30K',
        batteryType: 'Built-in',
        batteryLife: 90,
      },
    },
    {
      name: 'SteelSeries Rival 650 Wireless',
      description: 'Customizable weight wireless gaming mouse',
      price: priceWith99(100, 140),
      quantity: 22,
      imagesUrl: '/products/peripherals/mice3.jpg',
      sku: 'MOUSE-STEELSERIES-R650',
      subType: 'wireless',
      categoryId: mouseCategory.id,
      mouse: {
        brand: 'SteelSeries',
        color: 'Black',
        category: 'Gaming',
        dpi: 12000,
        buttons: 7,
        connection: 'Wireless',
        rgb: true,
        weight: 153.0,
        sensor: 'TrueMove3+',
        batteryType: 'Built-in',
        batteryLife: 24,
      },
    },
  ];

  // MousePad Peripherals
  const mousePadPeripherals = [
    {
      name: 'SteelSeries QcK Edge Large',
      description: 'Premium cloth gaming mouse pad with stitched edges',
      price: priceWith99(25, 35),
      quantity: 50,
      imagesUrl: '/products/peripherals/mousepads1.jpg',
      sku: 'PAD-STEELSERIES-QCKEDGE',
      subType: 'cloth',
      categoryId: mousePadCategory.id,
      mousePad: {
        brand: 'SteelSeries',
        dimensions: '450x400x2mm',
        thickness: 2.0,
        material: 'Cloth',
        rgb: false,
        surface: 'Smooth',
      },
    },
    {
      name: 'Corsair MM700 RGB Extended',
      description: 'RGB illuminated extended gaming mouse pad',
      price: priceWith99(50, 70),
      quantity: 30,
      imagesUrl: '/products/peripherals/mousepads2.jpg',
      sku: 'PAD-CORSAIR-MM700RGB',
      subType: 'extended',
      categoryId: mousePadCategory.id,
      mousePad: {
        brand: 'Corsair',
        dimensions: '930x400x4mm',
        thickness: 4.0,
        material: 'Micro-textured',
        rgb: true,
        surface: 'Speed',
      },
    },
    {
      name: 'Razer Goliathus Extended Chroma',
      description: 'Large RGB gaming surface for keyboard and mouse',
      price: priceWith99(40, 60),
      quantity: 35,
      imagesUrl: '/products/peripherals/mousepads3.jpg',
      sku: 'PAD-RAZER-GOLIATHUS',
      subType: 'extended',
      categoryId: mousePadCategory.id,
      mousePad: {
        brand: 'Razer',
        dimensions: '920x294x3mm',
        thickness: 3.0,
        material: 'Micro-weave cloth',
        rgb: true,
        surface: 'Control',
      },
    },
  ];

  // Monitor Peripherals
  const monitorPeripherals = [
    {
      name: 'ASUS ROG Swift PG279QM',
      description: '27" 1440p 240Hz IPS gaming monitor with G-Sync',
      price: priceWith99(500, 650),
      quantity: 15,
      imagesUrl: '/products/peripherals/monitors1.jpg',
      sku: 'MON-ASUS-PG279QM',
      subType: 'gaming',
      categoryId: monitorCategory.id,
      monitor: {
        brand: 'ASUS',
        size: 27.0,
        resolution: '2560x1440',
        refreshRate: 240,
        panelType: 'IPS',
        responseTime: 1.0,
        brightness: 400,
        hdr: true,
        ports: 'DisplayPort, HDMI, USB',
        speakers: false,
        curved: false,
      },
    },
    {
      name: 'Samsung Odyssey G7 32"',
      description: '32" 1440p 240Hz curved gaming monitor',
      price: priceWith99(600, 750),
      quantity: 12,
      imagesUrl: '/products/peripherals/monitors2.jpg',
      sku: 'MON-SAMSUNG-G732',
      subType: 'gaming',
      categoryId: monitorCategory.id,
      monitor: {
        brand: 'Samsung',
        size: 32.0,
        resolution: '2560x1440',
        refreshRate: 240,
        panelType: 'VA',
        responseTime: 1.0,
        brightness: 600,
        hdr: true,
        ports: 'DisplayPort, HDMI',
        speakers: false,
        curved: true,
      },
    },
    {
      name: 'LG UltraGear 27GN950-B',
      description: '27" 4K 144Hz Nano IPS gaming monitor',
      price: priceWith99(700, 850),
      quantity: 10,
      imagesUrl: '/products/peripherals/monitors3.jpg',
      sku: 'MON-LG-27GN950B',
      subType: 'gaming',
      categoryId: monitorCategory.id,
      monitor: {
        brand: 'LG',
        size: 27.0,
        resolution: '3840x2160',
        refreshRate: 144,
        panelType: 'Nano IPS',
        responseTime: 1.0,
        brightness: 400,
        hdr: true,
        ports: 'DisplayPort, HDMI, USB',
        speakers: false,
        curved: false,
      },
    },
  ];

  // Headphones Peripherals
  const headphonesPeripherals = [
    {
      name: 'SteelSeries Arctis Pro Wireless',
      description: 'Premium wireless gaming headset with dual battery system',
      price: priceWith99(250, 320),
      quantity: 20,
      imagesUrl: '/products/peripherals/headphones1.jpg',
      sku: 'HP-STEELSERIES-ARCTISPRO',
      subType: 'wireless',
      categoryId: headphonesCategory.id,
      headphones: {
        brand: 'SteelSeries',
        type: 'Over-ear',
        connection: 'Wireless',
        microphone: true,
        impedance: 32.0,
        frequency: '10Hz-40kHz',
        weight: 374.0,
        noiseCancelling: false,
        rgb: true,
      },
    },
    {
      name: 'Audio-Technica ATH-M50xBT2',
      description: 'Professional wireless studio headphones',
      price: priceWith99(150, 200),
      quantity: 25,
      imagesUrl: '/products/peripherals/headphones2.jpg',
      sku: 'HP-AUDIOTECHNICA-M50XBT2',
      subType: 'wireless',
      categoryId: headphonesCategory.id,
      headphones: {
        brand: 'Audio-Technica',
        type: 'Over-ear',
        connection: 'Wireless',
        microphone: true,
        impedance: 38.0,
        frequency: '15Hz-28kHz',
        weight: 307.0,
        noiseCancelling: false,
        rgb: false,
      },
    },
    {
      name: 'HyperX Cloud Alpha Wireless',
      description: 'Long-lasting wireless gaming headset',
      price: priceWith99(150, 190),
      quantity: 22,
      imagesUrl: '/products/peripherals/headphones3.jpg',
      sku: 'HP-HYPERX-CLOUDALPHA',
      subType: 'wireless',
      categoryId: headphonesCategory.id,
      headphones: {
        brand: 'HyperX',
        type: 'Over-ear',
        connection: 'Wireless',
        microphone: true,
        impedance: 62.0,
        frequency: '15Hz-21kHz',
        weight: 335.0,
        noiseCancelling: false,
        rgb: false,
      },
    },
  ];

  // Microphone Peripherals
  const microphonePeripherals = [
    {
      name: 'Blue Yeti USB Microphone',
      description: 'Professional USB condenser microphone for streaming',
      price: priceWith99(80, 120),
      quantity: 30,
      imagesUrl: '/products/peripherals/microphones1.jpg',
      sku: 'MIC-BLUE-YETI',
      subType: 'usb',
      categoryId: microphoneCategory.id,
      microphone: {
        brand: 'Blue',
        type: 'Condenser',
        pattern: 'Multi-pattern',
        frequency: 20000,
        sensitivity: -38.0,
        interface: 'USB',
        stand: true,
      },
    },
    {
      name: 'Audio-Technica AT2020USB+',
      description: 'Studio-quality USB condenser microphone',
      price: priceWith99(120, 160),
      quantity: 25,
      imagesUrl: '/products/peripherals/microphones2.jpg',
      sku: 'MIC-AUDIOTECHNICA-AT2020',
      subType: 'usb',
      categoryId: microphoneCategory.id,
      microphone: {
        brand: 'Audio-Technica',
        type: 'Condenser',
        pattern: 'Cardioid',
        frequency: 20000,
        sensitivity: -37.0,
        interface: 'USB',
        stand: false,
      },
    },
    {
      name: 'Shure SM7B Dynamic Microphone',
      description: 'Legendary broadcast microphone for professional use',
      price: priceWith99(350, 420),
      quantity: 15,
      imagesUrl: '/products/peripherals/microphones3.jpg',
      sku: 'MIC-SHURE-SM7B',
      subType: 'xlr',
      categoryId: microphoneCategory.id,
      microphone: {
        brand: 'Shure',
        type: 'Dynamic',
        pattern: 'Cardioid',
        frequency: 20000,
        sensitivity: -59.0,
        interface: 'XLR',
        stand: false,
      },
    },
  ];

  // Camera Peripherals
  const cameraPeripherals = [
    {
      name: 'Logitech C920 HD Pro Webcam',
      description: 'Full HD webcam for streaming and video calls',
      price: priceWith99(60, 80),
      quantity: 40,
      imagesUrl: '/products/peripherals/cameras1.jpg',
      sku: 'CAM-LOGITECH-C920',
      subType: 'webcam',
      categoryId: cameraCategory.id,
      camera: {
        brand: 'Logitech',
        resolution: '1920x1080',
        fps: 30.0,
        fov: 78.0,
        microphone: true,
        autofocus: true,
        connection: 'USB',
      },
    },
    {
      name: 'Razer Kiyo Pro Ultra',
      description: '4K streaming camera with advanced features',
      price: priceWith99(200, 250),
      quantity: 20,
      imagesUrl: '/products/peripherals/cameras2.jpg',
      sku: 'CAM-RAZER-KIYOPRO',
      subType: 'streaming',
      categoryId: cameraCategory.id,
      camera: {
        brand: 'Razer',
        resolution: '3840x2160',
        fps: 30.0,
        fov: 90.0,
        microphone: false,
        autofocus: true,
        connection: 'USB-C',
      },
    },
    {
      name: 'Elgato Facecam Pro',
      description: 'Professional 4K60 webcam for content creators',
      price: priceWith99(250, 300),
      quantity: 15,
      imagesUrl: '/products/peripherals/cameras3.jpg',
      sku: 'CAM-ELGATO-FACECAMPRO',
      subType: 'professional',
      categoryId: cameraCategory.id,
      camera: {
        brand: 'Elgato',
        resolution: '3840x2160',
        fps: 60.0,
        fov: 82.0,
        microphone: false,
        autofocus: true,
        connection: 'USB-C',
      },
    },
  ];

  // Speakers Peripherals
  const speakersPeripherals = [
    {
      name: 'Logitech Z623 2.1 Speaker System',
      description: 'Powerful 2.1 speaker system with subwoofer',
      price: priceWith99(100, 140),
      quantity: 25,
      imagesUrl: '/products/peripherals/speakers1.jpg',
      sku: 'SPK-LOGITECH-Z623',
      subType: '2.1',
      categoryId: speakersCategory.id,
      speakers: {
        brand: 'Logitech',
        type: '2.1',
        totalWattage: 200,
        frequency: '35Hz-20kHz',
        connections: '3.5mm, RCA',
        bluetooth: false,
        remote: true,
      },
    },
    {
      name: 'Creative Pebble V3',
      description: 'Compact desktop speakers with USB-C',
      price: priceWith99(40, 60),
      quantity: 35,
      imagesUrl: '/products/peripherals/speakers2.jpg',
      sku: 'SPK-CREATIVE-PEBBLEV3',
      subType: '2.0',
      categoryId: speakersCategory.id,
      speakers: {
        brand: 'Creative',
        type: '2.0',
        totalWattage: 16,
        frequency: '20Hz-20kHz',
        connections: 'USB-C, Bluetooth',
        bluetooth: true,
        remote: false,
      },
    },
    {
      name: 'Audioengine A2+ Desktop Speakers',
      description: 'Premium compact desktop speakers',
      price: priceWith99(200, 250),
      quantity: 20,
      imagesUrl: '/products/peripherals/speakers3.jpg',
      sku: 'SPK-AUDIOENGINE-A2PLUS',
      subType: '2.0',
      categoryId: speakersCategory.id,
      speakers: {
        brand: 'Audioengine',
        type: '2.0',
        totalWattage: 60,
        frequency: '65Hz-22kHz',
        connections: '3.5mm, USB, Bluetooth',
        bluetooth: true,
        remote: true,
      },
    },
  ];

  // Gamepad Peripherals
  const gamepadPeripherals = [
    {
      name: 'Xbox Wireless Controller',
      description: 'Official Xbox wireless controller for PC and Xbox',
      price: priceWith99(50, 70),
      quantity: 40,
      imagesUrl: '/products/peripherals/gamepads1.jpg',
      sku: 'GP-XBOX-WIRELESS',
      subType: 'wireless',
      categoryId: gamepadCategory.id,
      gamepad: {
        brand: 'Microsoft',
        connection: 'Wireless',
        platform: 'PC/Xbox',
        layout: 'Standard',
        vibration: true,
        rgb: false,
        batteryLife: 40,
        programmable: false,
      },
    },
    {
      name: 'PlayStation 5 DualSense Controller',
      description: 'Advanced wireless controller with haptic feedback',
      price: priceWith99(60, 80),
      quantity: 35,
      imagesUrl: '/products/peripherals/gamepads2.jpg',
      sku: 'GP-PS5-DUALSENSE',
      subType: 'wireless',
      categoryId: gamepadCategory.id,
      gamepad: {
        brand: 'Sony',
        connection: 'Wireless',
        platform: 'PC/PS5',
        layout: 'Standard',
        vibration: true,
        rgb: true,
        batteryLife: 12,
        programmable: false,
      },
    },
    {
      name: 'Razer Wolverine V2 Pro',
      description: 'Professional wireless gaming controller',
      price: priceWith99(200, 250),
      quantity: 15,
      imagesUrl: '/products/peripherals/gamepads3.jpg',
      sku: 'GP-RAZER-WOLVERINEV2',
      subType: 'pro',
      categoryId: gamepadCategory.id,
      gamepad: {
        brand: 'Razer',
        connection: 'Wireless',
        platform: 'PC/Xbox',
        layout: 'Pro',
        vibration: true,
        rgb: true,
        batteryLife: 28,
        programmable: true,
      },
    },
  ];
  // Create all peripherals
  for (const keyboardData of keyboardPeripherals) {
    const { keyboard, ...peripheralData } = keyboardData;
    try {
      const peripheral = await prisma.peripheral.create({
        data: peripheralData,
      });
      await prisma.keyboard.create({
        data: { ...keyboard, peripheralId: peripheral.id },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(
          `⚠️ Keyboard peripheral ${peripheralData.sku} already exists, skipping...`
        );
      } else {
        throw error;
      }
    }
  }

  for (const mouseData of mousePeripherals) {
    const { mouse, ...peripheralData } = mouseData;
    try {
      const peripheral = await prisma.peripheral.create({
        data: peripheralData,
      });
      await prisma.mouse.create({
        data: { ...mouse, peripheralId: peripheral.id },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(
          `⚠️ Mouse peripheral ${peripheralData.sku} already exists, skipping...`
        );
      } else {
        throw error;
      }
    }
  }

  for (const mousePadData of mousePadPeripherals) {
    const { mousePad, ...peripheralData } = mousePadData;
    try {
      const peripheral = await prisma.peripheral.create({
        data: peripheralData,
      });
      await prisma.mousePad.create({
        data: { ...mousePad, peripheralId: peripheral.id },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(
          `⚠️ Mouse pad peripheral ${peripheralData.sku} already exists, skipping...`
        );
      } else {
        throw error;
      }
    }
  }

  for (const monitorData of monitorPeripherals) {
    const { monitor, ...peripheralData } = monitorData;
    try {
      const peripheral = await prisma.peripheral.create({
        data: peripheralData,
      });
      await prisma.monitor.create({
        data: { ...monitor, peripheralId: peripheral.id },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(
          `⚠️ Monitor peripheral ${peripheralData.sku} already exists, skipping...`
        );
      } else {
        throw error;
      }
    }
  }

  for (const headphonesData of headphonesPeripherals) {
    const { headphones, ...peripheralData } = headphonesData;
    try {
      const peripheral = await prisma.peripheral.create({
        data: peripheralData,
      });
      await prisma.headphones.create({
        data: { ...headphones, peripheralId: peripheral.id },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(
          `⚠️ Headphones peripheral ${peripheralData.sku} already exists, skipping...`
        );
      } else {
        throw error;
      }
    }
  }

  for (const microphoneData of microphonePeripherals) {
    const { microphone, ...peripheralData } = microphoneData;
    try {
      const peripheral = await prisma.peripheral.create({
        data: peripheralData,
      });
      await prisma.microphone.create({
        data: { ...microphone, peripheralId: peripheral.id },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(
          `⚠️ Microphone peripheral ${peripheralData.sku} already exists, skipping...`
        );
      } else {
        throw error;
      }
    }
  }

  for (const cameraData of cameraPeripherals) {
    const { camera, ...peripheralData } = cameraData;
    try {
      const peripheral = await prisma.peripheral.create({
        data: peripheralData,
      });
      await prisma.camera.create({
        data: { ...camera, peripheralId: peripheral.id },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(
          `⚠️ Camera peripheral ${peripheralData.sku} already exists, skipping...`
        );
      } else {
        throw error;
      }
    }
  }

  for (const speakersData of speakersPeripherals) {
    const { speakers, ...peripheralData } = speakersData;
    try {
      const peripheral = await prisma.peripheral.create({
        data: peripheralData,
      });
      await prisma.speakers.create({
        data: { ...speakers, peripheralId: peripheral.id },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(
          `⚠️ Speakers peripheral ${peripheralData.sku} already exists, skipping...`
        );
      } else {
        throw error;
      }
    }
  }

  for (const gamepadData of gamepadPeripherals) {
    const { gamepad, ...peripheralData } = gamepadData;
    try {
      const peripheral = await prisma.peripheral.create({
        data: peripheralData,
      });
      await prisma.gamepad.create({
        data: { ...gamepad, peripheralId: peripheral.id },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(
          `⚠️ Gamepad peripheral ${peripheralData.sku} already exists, skipping...`
        );
      } else {
        throw error;
      }
    }
  }

  console.log('✅ Peripherals seeded successfully');
}
