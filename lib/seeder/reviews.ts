import { PrismaClient, ProductType } from '@prisma/client';

export async function seedReviews(prisma: PrismaClient) {
  // Get users who can leave reviews
  const users = await prisma.user.findMany({
    take: 15
  });
  
  // Get components and peripherals to review
  const components = await prisma.component.findMany({
    take: 20
  });
  
  const peripherals = await prisma.peripheral.findMany({
    take: 20
  });
  
  // Get configurations
  const configurations = await prisma.configuration.findMany({
    where: { isTemplate: true },
    take: 5
  });
  
  // Sample review titles
  const reviewTitles = [
    "Excellent product, highly recommend!",
    "Good value for money",
    "Not bad, but expected more",
    "Amazing performance!",
    "Disappointing quality",
    "Perfect for my needs",
    "Better than expected",
    "Great product with minor issues",
    "Would buy again",
    "Solid performance but overpriced",
    "Exceeded my expectations",
    "Best purchase I've made",
    "Don't waste your money",
    "Works as advertised",
    "Could be better for the price"
  ];
  
  // Sample positive review contents
  const positiveReviews = [
    "This product has exceeded all my expectations. The performance is outstanding and the build quality is top-notch. I've been using it daily for several weeks and haven't encountered any issues. Highly recommend to anyone looking for reliability and performance.",
    
    "I'm extremely satisfied with this purchase. Setup was straightforward, and it worked perfectly right out of the box. The design is sleek and modern, and it fits perfectly with my setup. Performance is excellent for the price point.",
    
    "Great value for money. While not the highest-end option available, it delivers consistent performance for everyday tasks and even handles demanding applications well. I particularly like the attention to detail in its construction.",
    
    "This is exactly what I was looking for. Fast, reliable, and well-built. Customer service was also excellent when I had some questions about optimization. Will definitely consider this brand for future purchases.",
    
    "After researching extensively, I decided on this product and I haven't been disappointed. It runs cool and quiet, which was a major consideration for me. The performance boost compared to my previous setup is substantial."
  ];
  
  // Sample mixed review contents
  const mixedReviews = [
    "Overall a good product, but there are a few minor issues. Performance is strong for the price range, but I noticed some inconsistencies during heavy workloads. Build quality is decent, though some parts feel less durable than others.",
    
    "Works as advertised and meets my needs, but I was expecting a bit more given the price point. The performance is adequate but not exceptional. Setup was more complicated than it needed to be based on the included instructions.",
    
    "A solid option with some trade-offs. I appreciate the design and core functionality, but the software interface could be more intuitive. Customer service was responsive when I reported a minor issue, which is a plus.",
    
    "Three months in and I have mixed feelings. It handles most tasks well but occasionally struggles with more demanding applications. Build quality seems good, but only time will tell about long-term durability.",
    
    "Not bad, but not amazing either. It does what it's supposed to do without any major problems, but doesn't really stand out from competitors. I'd recommend it if you can get it on sale."
  ];
  
  // Sample negative review contents
  const negativeReviews = [
    "Disappointing purchase. The performance falls short of advertised capabilities, and I've encountered several technical issues within the first few weeks. The build quality feels cheap for the price, and customer support has been unhelpful in resolving my problems.",
    
    "Would not recommend. This product started showing issues shortly after the warranty period ended. It runs hot and noisy, and performance degrades noticeably under sustained loads. Save your money and look elsewhere.",
    
    "Expected much better quality for the price. Setup was frustrating due to poor documentation, and even when properly configured, the performance is mediocre at best. I regret not returning it within the return window.",
    
    "This was a waste of money. The design has significant flaws that affect usability, and the performance is inconsistent. I've had to find workarounds for issues that shouldn't exist in a product at this price point.",
    
    "Avoid this product. Not only does it underperform compared to similarly-priced alternatives, but it also feels cheaply made. I've already encountered hardware failures that required replacement parts."
  ];
  
  // Generate reviews
  const reviews = [];
  const reviewCount = 50;
  
  const now = new Date();
  
  for (let i = 0; i < reviewCount; i++) {
    // Select a random user
    const user = users[i % users.length];
    
    // Determine review date (within the last 180 days)
    const daysAgo = Math.floor(Math.random() * 180);
    const reviewDate = new Date(now);
    reviewDate.setDate(reviewDate.getDate() - daysAgo);
    
    // Determine what is being reviewed
    const reviewType = i % 5 < 2 ? 'component' : (i % 5 < 4 ? 'peripheral' : 'configuration');
    
    let componentId = null;
    let peripheralId = null;
    let configurationId = null;
    
    if (reviewType === 'component' && components.length > 0) {
      componentId = components[i % components.length].id;
    } else if (reviewType === 'peripheral' && peripherals.length > 0) {
      peripheralId = peripherals[i % peripherals.length].id;
    } else if (reviewType === 'configuration' && configurations.length > 0) {
      configurationId = configurations[i % configurations.length].id;
    }
    
    // Determine rating (1-5)
    const rating = Math.min(5, Math.max(1, Math.floor(Math.random() * 5) + 1));
    
    // Select a title and content based on rating
    const title = reviewTitles[i % reviewTitles.length];
    let content;
    
    if (rating >= 4) {
      content = positiveReviews[i % positiveReviews.length];
    } else if (rating >= 3) {
      content = mixedReviews[i % mixedReviews.length];
    } else {
      content = negativeReviews[i % negativeReviews.length];
    }
    
    // Determine if the review is verified (based on a purchase)
    const isVerified = Math.random() > 0.3; // 70% of reviews are verified    // Determine productId and productType based on what's being reviewed
    let productId;
    let productType: ProductType;
    
    if (reviewType === 'component' && componentId) {
      productId = componentId;
      productType = ProductType.COMPONENT;
    } else if (reviewType === 'peripheral' && peripheralId) {
      productId = peripheralId;
      productType = ProductType.PERIPHERAL;
    } else if (reviewType === 'configuration' && configurationId) {
      productId = configurationId;
      productType = ProductType.CONFIGURATION;
    } else {
      // Skip this review if we don't have a valid product
      continue;
    }
    
    // Create the review
    reviews.push({
      userId: user.id,
      productId,
      productType,
      rating,
      comment: `${title}\n\n${content}`, // Combine title and content into comment
      purchaseDate: isVerified ? new Date(reviewDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null, // Random purchase date for verified reviews
      createdAt: reviewDate,
      updatedAt: reviewDate
    });
  }
    // Create a Set to track unique user-product combinations
  const userProductCombos = new Set();
  
  // Filter out duplicate reviews based on userId, productId, and productType
  const uniqueReviews = reviews.filter(review => {
    const combo = `${review.userId}-${review.productId}-${review.productType}`;
    if (userProductCombos.has(combo)) {
      return false;
    }
    userProductCombos.add(combo);
    return true;
  });
  
  console.log(`Creating ${uniqueReviews.length} unique reviews out of ${reviews.length} total`);
  // Insert unique reviews
  for (const review of uniqueReviews) {
    try {
      await prisma.review.create({
        data: review
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        console.log(`Skipping duplicate review for userId ${review.userId}, productId ${review.productId}`);
      } else {
        throw error;
      }
    }
  }
}
