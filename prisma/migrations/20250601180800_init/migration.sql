-- CreateEnum
CREATE TYPE "PromoCodeScope" AS ENUM ('ALL', 'SPECIFIC_PRODUCTS');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SPECIALIST');

-- CreateEnum
CREATE TYPE "ConfigStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RepairStatus" AS ENUM ('PENDING', 'DIAGNOSING', 'WAITING_FOR_PARTS', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RepairPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('CONFIGURATION', 'COMPONENT', 'PERIPHERAL');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "profileImageUrl" TEXT,
    "shippingAddress" TEXT,
    "shippingCity" TEXT,
    "shippingPostalCode" TEXT,
    "shippingCountry" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "componentcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'component',

    CONSTRAINT "componentcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configitem" (
    "id" TEXT NOT NULL,
    "configurationId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "configitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" "ConfigStatus" NOT NULL DEFAULT 'DRAFT',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "imageUrl" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "discountExpiresAt" TIMESTAMP(3),
    "discountPrice" DOUBLE PRECISION,

    CONSTRAINT "configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peripheralcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'peripheral',

    CONSTRAINT "peripheralcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peripheral" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sku" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "discountExpiresAt" TIMESTAMP(3),
    "discountPrice" DOUBLE PRECISION,
    "subType" TEXT NOT NULL,
    "imagesUrl" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "peripheral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "RepairStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "RepairPriority" NOT NULL DEFAULT 'NORMAL',
    "userId" TEXT NOT NULL,
    "peripheralId" TEXT,
    "configurationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estimatedCost" DOUBLE PRECISION,
    "finalCost" DOUBLE PRECISION,
    "completionDate" TIMESTAMP(3),
    "diagnosticNotes" TEXT,

    CONSTRAINT "repair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repairspecialist" (
    "id" TEXT NOT NULL,
    "repairId" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "repairspecialist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repairpart" (
    "id" TEXT NOT NULL,
    "repairId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "repairpart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "configurationId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "shippingAddress" TEXT,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shippingMethod" TEXT,
    "isGuestOrder" BOOLEAN NOT NULL DEFAULT false,
    "shippingEmail" TEXT,
    "shippingName" TEXT,
    "shippingPhone" TEXT,
    "discount" DOUBLE PRECISION DEFAULT 0,
    "shippingCost" DOUBLE PRECISION DEFAULT 10,
    "locale" TEXT DEFAULT 'en',

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_helpful" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isHelpful" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_helpful_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promocode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountPercentage" INTEGER NOT NULL,
    "maxDiscountAmount" DOUBLE PRECISION,
    "minOrderValue" DOUBLE PRECISION,
    "maxUsage" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scope" "PromoCodeScope" NOT NULL DEFAULT 'ALL',

    CONSTRAINT "promocode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promoproduct" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productType" TEXT NOT NULL,

    CONSTRAINT "promoproduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL DEFAULT '',
    "details" TEXT NOT NULL,
    "ipAddress" TEXT DEFAULT '',
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "content" TEXT,
    "bannerImageUrl" TEXT,
    "promoCodeId" TEXT,
    "metadata" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_metrics" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "component" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sku" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "discountExpiresAt" TIMESTAMP(3),
    "discountPrice" DOUBLE PRECISION,
    "subType" TEXT NOT NULL,
    "imagesUrl" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpu" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "socket" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "cores" INTEGER NOT NULL,
    "integratedGpu" BOOLEAN NOT NULL,
    "frequency" DOUBLE PRECISION NOT NULL,
    "maxRamCapacity" INTEGER NOT NULL,
    "maxRamFrequency" INTEGER NOT NULL,
    "multithreading" BOOLEAN NOT NULL,
    "brand" TEXT NOT NULL,
    "powerConsumption" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "cpu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gpu" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "memoryType" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "chipType" TEXT NOT NULL,
    "fanCount" INTEGER NOT NULL,
    "hasDVI" BOOLEAN NOT NULL,
    "hasDisplayPort" BOOLEAN NOT NULL,
    "hasHDMI" BOOLEAN NOT NULL,
    "hasVGA" BOOLEAN NOT NULL,
    "videoMemoryCapacity" INTEGER NOT NULL,
    "powerConsumption" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subBrand" TEXT,
    "architecture" TEXT,

    CONSTRAINT "gpu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motherboard" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "socket" TEXT NOT NULL,
    "memorySlots" INTEGER NOT NULL,
    "m2Slots" INTEGER NOT NULL,
    "brand" TEXT NOT NULL,
    "maxMemoryFrequency" INTEGER NOT NULL,
    "maxRamCapacity" INTEGER NOT NULL,
    "maxVideoCards" INTEGER NOT NULL,
    "memoryTypeSupported" TEXT NOT NULL,
    "nvmeSupport" BOOLEAN NOT NULL,
    "processorSupport" TEXT NOT NULL,
    "sataPorts" INTEGER NOT NULL,
    "sliCrossfireSupport" BOOLEAN NOT NULL,
    "wifiBluetooth" BOOLEAN NOT NULL,
    "form" TEXT,
    "compatibility" TEXT,

    CONSTRAINT "motherboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ram" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "voltage" DOUBLE PRECISION NOT NULL,
    "backlighting" BOOLEAN NOT NULL,
    "brand" TEXT NOT NULL,
    "maxFrequency" INTEGER NOT NULL,
    "memoryType" TEXT NOT NULL,
    "moduleCount" INTEGER NOT NULL,
    "powerConsumption" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gb" INTEGER,

    CONSTRAINT "ram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "readSpeed" DOUBLE PRECISION NOT NULL,
    "writeSpeed" DOUBLE PRECISION NOT NULL,
    "brand" TEXT NOT NULL,
    "compatibility" TEXT NOT NULL,
    "nvme" BOOLEAN NOT NULL,
    "size" TEXT NOT NULL,
    "volume" INTEGER NOT NULL,
    "powerConsumption" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psu" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "hasFan" BOOLEAN NOT NULL,
    "molexPataConnections" INTEGER NOT NULL,
    "pciEConnections" INTEGER NOT NULL,
    "pfc" BOOLEAN NOT NULL,
    "power" INTEGER NOT NULL,
    "sataConnections" INTEGER NOT NULL,
    "energyEfficiency" TEXT,

    CONSTRAINT "psu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cooling" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "fanDiameter" DOUBLE PRECISION NOT NULL,
    "fanSpeed" INTEGER NOT NULL,
    "socket" TEXT NOT NULL,
    "category" TEXT,
    "radiatorSize" TEXT,
    "subCategory" TEXT,

    CONSTRAINT "cooling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "audioIn" BOOLEAN NOT NULL,
    "audioOut" BOOLEAN NOT NULL,
    "brand" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "powerSupplyIncluded" BOOLEAN NOT NULL,
    "slots25" INTEGER NOT NULL,
    "slots35" INTEGER NOT NULL,
    "slots525" INTEGER NOT NULL,
    "usb2" INTEGER NOT NULL,
    "usb3" INTEGER NOT NULL,
    "usb32" INTEGER NOT NULL,
    "usbTypeC" INTEGER NOT NULL,
    "waterCoolingSupport" BOOLEAN NOT NULL,
    "form" TEXT,

    CONSTRAINT "case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyboard" (
    "id" TEXT NOT NULL,
    "peripheralId" TEXT NOT NULL,
    "switchType" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "connection" TEXT NOT NULL,
    "rgb" BOOLEAN NOT NULL,
    "numpad" BOOLEAN NOT NULL,
    "brand" TEXT NOT NULL,
    "form" TEXT NOT NULL,

    CONSTRAINT "keyboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouse" (
    "id" TEXT NOT NULL,
    "peripheralId" TEXT NOT NULL,
    "dpi" INTEGER NOT NULL,
    "buttons" INTEGER NOT NULL,
    "connection" TEXT NOT NULL,
    "rgb" BOOLEAN NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "sensor" TEXT NOT NULL,
    "batteryLife" INTEGER NOT NULL,
    "batteryType" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "mouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microphone" (
    "id" TEXT NOT NULL,
    "peripheralId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL,
    "sensitivity" DOUBLE PRECISION NOT NULL,
    "interface" TEXT NOT NULL,
    "stand" BOOLEAN NOT NULL,
    "brand" TEXT NOT NULL,

    CONSTRAINT "microphone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera" (
    "id" TEXT NOT NULL,
    "peripheralId" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "fps" DOUBLE PRECISION NOT NULL,
    "fov" DOUBLE PRECISION NOT NULL,
    "microphone" BOOLEAN NOT NULL,
    "autofocus" BOOLEAN NOT NULL,
    "connection" TEXT NOT NULL,
    "brand" TEXT NOT NULL,

    CONSTRAINT "camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitor" (
    "id" TEXT NOT NULL,
    "peripheralId" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "resolution" TEXT NOT NULL,
    "refreshRate" INTEGER NOT NULL,
    "panelType" TEXT NOT NULL,
    "responseTime" DOUBLE PRECISION NOT NULL,
    "brightness" INTEGER NOT NULL,
    "hdr" BOOLEAN NOT NULL,
    "ports" TEXT NOT NULL,
    "speakers" BOOLEAN NOT NULL,
    "curved" BOOLEAN NOT NULL,
    "brand" TEXT NOT NULL,

    CONSTRAINT "monitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "headphones" (
    "id" TEXT NOT NULL,
    "peripheralId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "connection" TEXT NOT NULL,
    "microphone" BOOLEAN NOT NULL,
    "impedance" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "noiseCancelling" BOOLEAN NOT NULL,
    "rgb" BOOLEAN NOT NULL,
    "brand" TEXT NOT NULL,

    CONSTRAINT "headphones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speakers" (
    "id" TEXT NOT NULL,
    "peripheralId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "totalWattage" INTEGER NOT NULL,
    "frequency" TEXT NOT NULL,
    "connections" TEXT NOT NULL,
    "bluetooth" BOOLEAN NOT NULL,
    "remote" BOOLEAN NOT NULL,
    "brand" TEXT NOT NULL,

    CONSTRAINT "speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamepad" (
    "id" TEXT NOT NULL,
    "peripheralId" TEXT NOT NULL,
    "connection" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "vibration" BOOLEAN NOT NULL,
    "rgb" BOOLEAN NOT NULL,
    "batteryLife" INTEGER NOT NULL,
    "programmable" BOOLEAN NOT NULL,
    "brand" TEXT NOT NULL,

    CONSTRAINT "gamepad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mousepad" (
    "id" TEXT NOT NULL,
    "peripheralId" TEXT NOT NULL,
    "dimensions" TEXT NOT NULL,
    "thickness" DOUBLE PRECISION NOT NULL,
    "material" TEXT NOT NULL,
    "rgb" BOOLEAN NOT NULL,
    "surface" TEXT NOT NULL,
    "brand" TEXT NOT NULL,

    CONSTRAINT "mousepad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "componentcategory_name_key" ON "componentcategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "componentcategory_slug_key" ON "componentcategory"("slug");

-- CreateIndex
CREATE INDEX "configitem_componentId_idx" ON "configitem"("componentId");

-- CreateIndex
CREATE INDEX "configitem_configurationId_idx" ON "configitem"("configurationId");

-- CreateIndex
CREATE INDEX "configuration_userId_idx" ON "configuration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "peripheralcategory_name_key" ON "peripheralcategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "peripheralcategory_slug_key" ON "peripheralcategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "peripheral_sku_key" ON "peripheral"("sku");

-- CreateIndex
CREATE INDEX "peripheral_categoryId_idx" ON "peripheral"("categoryId");

-- CreateIndex
CREATE INDEX "repair_configurationId_idx" ON "repair"("configurationId");

-- CreateIndex
CREATE INDEX "repair_peripheralId_idx" ON "repair"("peripheralId");

-- CreateIndex
CREATE INDEX "repair_userId_idx" ON "repair"("userId");

-- CreateIndex
CREATE INDEX "repairspecialist_specialistId_idx" ON "repairspecialist"("specialistId");

-- CreateIndex
CREATE UNIQUE INDEX "repairspecialist_repairId_specialistId_key" ON "repairspecialist"("repairId", "specialistId");

-- CreateIndex
CREATE INDEX "repairpart_componentId_idx" ON "repairpart"("componentId");

-- CreateIndex
CREATE INDEX "repairpart_repairId_idx" ON "repairpart"("repairId");

-- CreateIndex
CREATE INDEX "order_configurationId_idx" ON "order"("configurationId");

-- CreateIndex
CREATE INDEX "order_userId_idx" ON "order"("userId");

-- CreateIndex
CREATE INDEX "review_productId_productType_idx" ON "review"("productId", "productType");

-- CreateIndex
CREATE UNIQUE INDEX "review_userId_productId_productType_key" ON "review"("userId", "productId", "productType");

-- CreateIndex
CREATE INDEX "review_helpful_userId_idx" ON "review_helpful"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "review_helpful_reviewId_userId_key" ON "review_helpful"("reviewId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_userId_productId_productType_key" ON "wishlist"("userId", "productId", "productType");

-- CreateIndex
CREATE INDEX "order_item_orderId_idx" ON "order_item"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "promocode_code_key" ON "promocode"("code");

-- CreateIndex
CREATE INDEX "promoproduct_promoCodeId_idx" ON "promoproduct"("promoCodeId");

-- CreateIndex
CREATE INDEX "audit_log_userId_idx" ON "audit_log"("userId");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");

-- CreateIndex
CREATE INDEX "audit_log_entityType_idx" ON "audit_log"("entityType");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "marketing_campaign_promoCodeId_idx" ON "marketing_campaign"("promoCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_metrics_campaignId_key" ON "campaign_metrics"("campaignId");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "component_sku_key" ON "component"("sku");

-- CreateIndex
CREATE INDEX "component_categoryId_idx" ON "component"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "cpu_componentId_key" ON "cpu"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "gpu_componentId_key" ON "gpu"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "motherboard_componentId_key" ON "motherboard"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "ram_componentId_key" ON "ram"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "storage_componentId_key" ON "storage"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "psu_componentId_key" ON "psu"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "cooling_componentId_key" ON "cooling"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "case_componentId_key" ON "case"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "keyboard_peripheralId_key" ON "keyboard"("peripheralId");

-- CreateIndex
CREATE UNIQUE INDEX "mouse_peripheralId_key" ON "mouse"("peripheralId");

-- CreateIndex
CREATE UNIQUE INDEX "microphone_peripheralId_key" ON "microphone"("peripheralId");

-- CreateIndex
CREATE UNIQUE INDEX "camera_peripheralId_key" ON "camera"("peripheralId");

-- CreateIndex
CREATE UNIQUE INDEX "monitor_peripheralId_key" ON "monitor"("peripheralId");

-- CreateIndex
CREATE UNIQUE INDEX "headphones_peripheralId_key" ON "headphones"("peripheralId");

-- CreateIndex
CREATE UNIQUE INDEX "speakers_peripheralId_key" ON "speakers"("peripheralId");

-- CreateIndex
CREATE UNIQUE INDEX "gamepad_peripheralId_key" ON "gamepad"("peripheralId");

-- CreateIndex
CREATE UNIQUE INDEX "mousepad_peripheralId_key" ON "mousepad"("peripheralId");

-- AddForeignKey
ALTER TABLE "configitem" ADD CONSTRAINT "config_item_component_fk" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configitem" ADD CONSTRAINT "config_item_configuration_fk" FOREIGN KEY ("configurationId") REFERENCES "configuration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration" ADD CONSTRAINT "configuration_user_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peripheral" ADD CONSTRAINT "peripheral_category_fk" FOREIGN KEY ("categoryId") REFERENCES "peripheralcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair" ADD CONSTRAINT "repair_configuration_fk" FOREIGN KEY ("configurationId") REFERENCES "configuration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair" ADD CONSTRAINT "repair_peripheral_fk" FOREIGN KEY ("peripheralId") REFERENCES "peripheral"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair" ADD CONSTRAINT "repair_user_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repairspecialist" ADD CONSTRAINT "repair_specialist_repair_fk" FOREIGN KEY ("repairId") REFERENCES "repair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repairspecialist" ADD CONSTRAINT "repair_specialist_user_fk" FOREIGN KEY ("specialistId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repairpart" ADD CONSTRAINT "repair_part_component_fk" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repairpart" ADD CONSTRAINT "repair_part_repair_fk" FOREIGN KEY ("repairId") REFERENCES "repair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_configuration_fk" FOREIGN KEY ("configurationId") REFERENCES "configuration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_user_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_helpful" ADD CONSTRAINT "review_helpful_review_fk" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_helpful" ADD CONSTRAINT "review_helpful_user_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_fk" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promoproduct" ADD CONSTRAINT "promo_product_promo_code_fk" FOREIGN KEY ("promoCodeId") REFERENCES "promocode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_campaign" ADD CONSTRAINT "marketing_campaign_promo_code_fk" FOREIGN KEY ("promoCodeId") REFERENCES "promocode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_metrics" ADD CONSTRAINT "campaign_metrics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "marketing_campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "account_user_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "session_user_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_token_user_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component" ADD CONSTRAINT "component_category_fk" FOREIGN KEY ("categoryId") REFERENCES "componentcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpu" ADD CONSTRAINT "cpu_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gpu" ADD CONSTRAINT "gpu_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motherboard" ADD CONSTRAINT "motherboard_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ram" ADD CONSTRAINT "ram_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage" ADD CONSTRAINT "storage_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psu" ADD CONSTRAINT "psu_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cooling" ADD CONSTRAINT "cooling_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case" ADD CONSTRAINT "case_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyboard" ADD CONSTRAINT "keyboard_peripheralId_fkey" FOREIGN KEY ("peripheralId") REFERENCES "peripheral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouse" ADD CONSTRAINT "mouse_peripheralId_fkey" FOREIGN KEY ("peripheralId") REFERENCES "peripheral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microphone" ADD CONSTRAINT "microphone_peripheralId_fkey" FOREIGN KEY ("peripheralId") REFERENCES "peripheral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camera" ADD CONSTRAINT "camera_peripheralId_fkey" FOREIGN KEY ("peripheralId") REFERENCES "peripheral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitor" ADD CONSTRAINT "monitor_peripheralId_fkey" FOREIGN KEY ("peripheralId") REFERENCES "peripheral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "headphones" ADD CONSTRAINT "headphones_peripheralId_fkey" FOREIGN KEY ("peripheralId") REFERENCES "peripheral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speakers" ADD CONSTRAINT "speakers_peripheralId_fkey" FOREIGN KEY ("peripheralId") REFERENCES "peripheral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamepad" ADD CONSTRAINT "gamepad_peripheralId_fkey" FOREIGN KEY ("peripheralId") REFERENCES "peripheral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mousepad" ADD CONSTRAINT "mousepad_peripheralId_fkey" FOREIGN KEY ("peripheralId") REFERENCES "peripheral"("id") ON DELETE CASCADE ON UPDATE CASCADE;
