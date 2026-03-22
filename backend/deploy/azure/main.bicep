// Azure Bicep template for CreditIQ infrastructure
// Deploy with: az deployment group create --resource-group creditiq-rg --template-file main.bicep

@description('Location for all resources')
param location string = resourceGroup().location

@description('Unique suffix for resource names')
param uniqueSuffix string = uniqueString(resourceGroup().id)

// ─── App Service Plan ──────────────────────────────────────
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: 'creditiq-plan'
  location: location
  sku: {
    name: 'B2'
    tier: 'Basic'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// ─── App Service ───────────────────────────────────────────
resource appService 'Microsoft.Web/sites@2023-12-01' = {
  name: 'creditiq-api-${uniqueSuffix}'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appCommandLine: 'npm start'
      alwaysOn: true
      appSettings: [
        { name: 'NODE_ENV', value: 'production' }
        { name: 'PORT', value: '8080' }
      ]
    }
    httpsOnly: true
  }
}

// ─── PostgreSQL Flexible Server ─────────────────────────────
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: 'creditiq-db-${uniqueSuffix}'
  location: location
  sku: {
    name: 'Standard_D2ds_v4'
    tier: 'GeneralPurpose'
  }
  properties: {
    version: '16'
    administratorLogin: 'creditiqadmin'
    administratorLoginPassword: 'CreditIQ-DB-2026!'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource postgresDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-12-01-preview' = {
  parent: postgresServer
  name: 'creditiq'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// ─── Storage Account ────────────────────────────────────────
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'creditiqstorage${uniqueSuffix}'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

resource reportsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'reports'
  properties: { publicAccess: 'None' }
}

resource uploadsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'uploads'
  properties: { publicAccess: 'None' }
}

// ─── Key Vault ──────────────────────────────────────────────
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'creditiq-vault-${uniqueSuffix}'
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: { family: 'A', name: 'standard' }
    enableRbacAuthorization: true
    enableSoftDelete: true
  }
}

// ─── Redis Cache ────────────────────────────────────────────
resource redisCache 'Microsoft.Cache/redis@2024-03-01' = {
  name: 'creditiq-redis-${uniqueSuffix}'
  location: location
  properties: {
    sku: {
      name: 'Basic'
      family: 'C'
      capacity: 0
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
  }
}

// ─── Outputs ────────────────────────────────────────────────
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output postgresHost string = postgresServer.properties.fullyQualifiedDomainName
output storageAccountName string = storageAccount.name
output keyVaultUri string = keyVault.properties.vaultUri
output redisHostName string = redisCache.properties.hostName
