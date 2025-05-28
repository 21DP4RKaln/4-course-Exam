import { PrismaClient } from '@prisma/client';

export async function seedCameras(prisma: PrismaClient) {
  // Get all peripherals with subType 'cameras'
  const cameraPeripherals = await prisma.peripheral.findMany({
    where: { subType: 'cameras' }
  });

  // Prepare Camera entries
  const cameras = [];    // For each Camera peripheral, create a detailed Camera entry
  for (let i = 0; i < cameraPeripherals.length; i++) {
    const peripheral = cameraPeripherals[i];
    
    // Parse existing specifications if available
    const specs = peripheral.specifications ? JSON.parse(peripheral.specifications.toString()) : {};
    
    // Manufacturers
    const manufacturers = ['Logitech', 'Razer', 'Elgato', 'AVerMedia', 'Microsoft', 'Canon', 'Sony'];
    const manufacturer = specs.manufacturer || manufacturers[i % manufacturers.length];
    
    // Resolution ranges
    const resolutions = ['720p', '1080p', '1440p', '4K'];
    const resolution = specs.resolution || resolutions[Math.min(i, resolutions.length - 1)];
    
    // Frame rates - extract just the number for the fps field
    let frameRate;
    let fps;
    switch (resolution) {
      case '720p':
        frameRate = '120fps';
        fps = 120;
        break;
      case '1080p':
        frameRate = i % 2 === 0 ? '60fps' : '120fps';
        fps = i % 2 === 0 ? 60 : 120;
        break;
      case '1440p':
        frameRate = i % 2 === 0 ? '30fps' : '60fps';
        fps = i % 2 === 0 ? 30 : 60;
        break;
      case '4K':
        frameRate = i % 3 === 0 ? '60fps' : '30fps';
        fps = i % 3 === 0 ? 60 : 30;
        break;
      default:
        frameRate = '30fps';
        fps = 30;
    }
    
    // Connection types
    const connections = ['USB-A 3.0', 'USB-C', 'USB-A 2.0', 'USB-C Thunderbolt'];
    const connection = specs.connection || connections[i % connections.length];
    
    // FOV (Field of View) - extract just the number
    const fovs = [65, 78, 80, 90, 95, 110];
    const fov = specs.fov ? parseInt(specs.fov) : fovs[i % fovs.length];
    
    // Autofocus capability
    const autofocus = i % 4 !== 3;
    
    // Determine if it has a microphone
    const hasMicrophone = i % 3 !== 2; // 2/3 of cameras have microphones
    
    // Store additional specs in the peripheral's specifications JSON
    const additionalSpecs = {
      mountType: i % 2 === 0 ? 'Standard' : 'Clip',
      sensor: ['CMOS', 'CCD'][i % 2],
      zoom: i % 3 === 0 ? '4x Digital' : 'None',
      privacy: i % 2 === 0,
      hdr: resolution === '4K' || (resolution === '1080p' && i % 2 === 0),
      lowLightPerformance: i % 4 === 0 ? 'Excellent' : (i % 4 === 1 ? 'Good' : 'Average'),
      dimensions: `${70 + (i % 5) * 10}mm x ${30 + i % 5}mm x ${30 + i % 5}mm`,
      microphoneType: hasMicrophone ? (i % 2 === 0 ? 'Stereo' : 'Mono') : 'None'
    };
    
    // Update peripheral specifications to include the additional camera specs
    await prisma.peripheral.update({
      where: { id: peripheral.id },
      data: {
        specifications: JSON.stringify({ ...specs, ...additionalSpecs })
      }
    });
    
    cameras.push({
      peripheralId: peripheral.id,
      manufacturer,
      resolution,
      fps,
      fov,
      microphone: hasMicrophone,
      autofocus,
      connection
    });
  }

  // Insert Camera entries
  for (const camera of cameras) {
    await prisma.camera.upsert({
      where: { peripheralId: camera.peripheralId },
      update: camera,
      create: camera
    });
  }
  
  // Call the function to add 10 more cameras
  await addMoreCameras(prisma);
}

/**
 * Adds 10 additional camera entries with unique specifications
 */
async function addMoreCameras(prisma: PrismaClient) {  const category = await prisma.peripheralCategory.findFirst({
    where: { slug: 'camera' }
  });
  
  if (!category) {
    console.error('Camera category not found');
    return;
  }
  
  // Define new camera models with interesting specifications
  const newCameraModels = [
    {
      name: 'Sony Alpha ZV-E10',
      manufacturer: 'Sony',
      resolution: '4K',
      fps: 60,
      fov: 100,
      microphone: true,
      autofocus: true,
      connection: 'USB-C',
      price: 299.99,
      specs: {
        mountType: 'Interchangeable Lens',
        sensor: 'CMOS APS-C',
        zoom: '3x Optical + 5x Digital',
        privacy: false,
        hdr: true,
        lowLightPerformance: 'Excellent',
        dimensions: '115mm x 64mm x 45mm',
        microphoneType: 'Directional 3-Capsule',
        connectivity: 'Wired/Wireless',
        interface: 'USB-C/WiFi',
        color: 'Black',
        weight: '343g',
        warranty: '3 years'
      }
    },
    {
      name: 'Elgato Facecam Pro',
      manufacturer: 'Elgato',
      resolution: '4K',
      fps: 60,
      fov: 90,
      microphone: false,
      autofocus: true,
      connection: 'USB-C',
      price: 199.99,
      specs: {
        mountType: 'Clip/Tripod',
        sensor: 'Sony STARVIS CMOS',
        zoom: '8x Digital',
        privacy: true,
        hdr: true,
        lowLightPerformance: 'Excellent',
        dimensions: '90mm x 58mm x 48mm',
        microphoneType: 'None',
        connectivity: 'Wired',
        interface: 'USB-C 3.0',
        color: 'Black',
        weight: '100g',
        warranty: '2 years'
      }
    },
    {
      name: 'Logitech StreamCam Plus',
      manufacturer: 'Logitech',
      resolution: '1080p',
      fps: 60,
      fov: 78,
      microphone: true,
      autofocus: true,
      connection: 'USB-C',
      price: 169.99,
      specs: {
        mountType: 'Clip/Tripod',
        sensor: 'CMOS',
        zoom: 'None',
        privacy: true,
        hdr: true,
        lowLightPerformance: 'Good',
        dimensions: '85mm x 58mm x 48mm',
        microphoneType: 'Stereo',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'White/Gray',
        weight: '85g',
        warranty: '2 years'
      }
    },
    {
      name: 'Razer Kiyo Pro Ultra',
      manufacturer: 'Razer',
      resolution: '4K',
      fps: 30,
      fov: 105,
      microphone: true,
      autofocus: true,
      connection: 'USB-A 3.0',
      price: 299.99,
      specs: {
        mountType: 'Clip',
        sensor: 'STARVIS 2 CMOS',
        zoom: '4x Digital',
        privacy: true,
        hdr: true,
        lowLightPerformance: 'Excellent',
        dimensions: '89mm x 89mm x 55mm',
        microphoneType: 'Stereo',
        connectivity: 'Wired',
        interface: 'USB-A 3.0',
        color: 'Black/RGB',
        weight: '340g',
        warranty: '2 years'
      }
    },
    {
      name: 'AVerMedia Live Streamer CAM 513',
      manufacturer: 'AVerMedia',
      resolution: '4K',
      fps: 30,
      fov: 94,
      microphone: true,
      autofocus: true,
      connection: 'USB-A 3.0',
      price: 249.99,
      specs: {
        mountType: 'Standard',
        sensor: 'CMOS',
        zoom: '3x Digital',
        privacy: false,
        hdr: true,
        lowLightPerformance: 'Good',
        dimensions: '92mm x 60mm x 50mm',
        microphoneType: 'Mono',
        connectivity: 'Wired',
        interface: 'USB-A 3.0',
        color: 'Red/Black',
        weight: '160g',
        warranty: '2 years'
      }
    },
    {
      name: 'Canon EOS Webcam R7',
      manufacturer: 'Canon',
      resolution: '4K',
      fps: 60,
      fov: 110,
      microphone: true,
      autofocus: true,
      connection: 'USB-C',
      price: 349.99,
      specs: {
        mountType: 'Tripod',
        sensor: 'APS-C CMOS',
        zoom: '10x Optical',
        privacy: false,
        hdr: true,
        lowLightPerformance: 'Excellent',
        dimensions: '132mm x 90mm x 70mm',
        microphoneType: 'Stereo',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'Black',
        weight: '450g',
        warranty: '3 years'
      }
    },
    {
      name: 'Microsoft Modern Webcam',
      manufacturer: 'Microsoft',
      resolution: '1080p',
      fps: 30,
      fov: 78,
      microphone: true,
      autofocus: true,
      connection: 'USB-A 2.0',
      price: 69.99,
      specs: {
        mountType: 'Clip',
        sensor: 'CMOS',
        zoom: 'None',
        privacy: true,
        hdr: false,
        lowLightPerformance: 'Average',
        dimensions: '65mm x 45mm x 30mm',
        microphoneType: 'Mono',
        connectivity: 'Wired',
        interface: 'USB-A 2.0',
        color: 'Black',
        weight: '88g',
        warranty: '1 year'
      }
    },
    {
      name: 'Insta360 Link',
      manufacturer: 'Insta360',
      resolution: '4K',
      fps: 30,
      fov: 79,
      microphone: true,
      autofocus: true,
      connection: 'USB-C',
      price: 299.99,
      specs: {
        mountType: 'Gimbal',
        sensor: 'CMOS',
        zoom: '4x Digital',
        privacy: true,
        hdr: true,
        lowLightPerformance: 'Good',
        dimensions: '70mm x 40mm x 45mm',
        microphoneType: 'Dual',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'Black',
        weight: '106g',
        warranty: '2 years',
        aiTracking: true,
        gestureControl: true
      }
    },
    {
      name: 'OBSBOT Tiny 4K',
      manufacturer: 'OBSBOT',
      resolution: '4K',
      fps: 30,
      fov: 86,
      microphone: true,
      autofocus: true,
      connection: 'USB-C',
      price: 269.99,
      specs: {
        mountType: 'Gimbal',
        sensor: 'CMOS',
        zoom: '4x Digital',
        privacy: true,
        hdr: true,
        lowLightPerformance: 'Good',
        dimensions: '89mm x 58mm x 58mm',
        microphoneType: 'Dual',
        connectivity: 'Wired',
        interface: 'USB-C',
        color: 'Black',
        weight: '147g',
        warranty: '1 year',
        aiTracking: true,
        gestureControl: true
      }
    },
    {
      name: 'Poly Studio P5',
      manufacturer: 'Poly',
      resolution: '1080p',
      fps: 30,
      fov: 80,
      microphone: true,
      autofocus: true,
      connection: 'USB-A 3.0',
      price: 129.99,
      specs: {
        mountType: 'Clip',
        sensor: 'CMOS',
        zoom: 'None',
        privacy: true,
        hdr: false,
        lowLightPerformance: 'Good',
        dimensions: '75mm x 40mm x 40mm',
        microphoneType: 'Mono',
        connectivity: 'Wired',
        interface: 'USB-A 3.0',
        color: 'Black',
        weight: '120g',
        warranty: '2 years',
        noiseReduction: true
      }
    }
  ];
  
  // Create new camera peripherals and camera entries
  for (let i = 0; i < newCameraModels.length; i++) {
    const model = newCameraModels[i];
    
    // Generate a unique SKU
    const sku = `P-CAM-${model.manufacturer.substring(0, 3).toUpperCase()}-${2000 + i}`;
    
    // Create the peripheral entry
    const peripheral = await prisma.peripheral.create({
      data: {
        name: model.name,
        description: `${model.name} - Professional webcam with ${model.resolution} resolution at ${model.fps}fps. ${model.microphone ? 'Built-in microphone.' : 'No microphone.'}`,
        price: model.price,
        stock: 10 + Math.floor(Math.random() * 40),
        categoryId: category.id,
        specifications: JSON.stringify(model.specs),
        sku,
        subType: 'cameras',
        imageUrl: `/products/peripherals/cameras${(i % 3) + 1}.jpg`,
      }
    });
    
    // Create the camera entry
    await prisma.camera.create({
      data: {
        peripheralId: peripheral.id,
        manufacturer: model.manufacturer,
        resolution: model.resolution,
        fps: model.fps,
        fov: model.fov,
        microphone: model.microphone,
        autofocus: model.autofocus,
        connection: model.connection
      }
    });
    
    console.log(`Added camera: ${model.name}`);
  }
  
  console.log('Added 10 additional cameras');
}
