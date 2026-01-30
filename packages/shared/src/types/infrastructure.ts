// Domain Provider Types
export interface DomainAvailability {
  domain: string;
  available: boolean;
  premium: boolean;
  price?: number;
  currency?: string;
}

export interface DomainSearchResult {
  domain: string;
  tld: string;
  available: boolean;
  price?: number;
  currency?: string;
}

export interface DomainRegistration {
  domain: string;
  registrationDate: Date;
  expirationDate: Date;
  nameservers: string[];
  registrarId: string;
}

export interface DomainRenewal {
  domain: string;
  newExpirationDate: Date;
  cost: number;
}

export interface DomainInfo {
  domain: string;
  status: string;
  registrationDate: Date;
  expirationDate: Date;
  autoRenew: boolean;
  nameservers: string[];
  locked: boolean;
}

export interface DnsRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA';
  name: string;
  content: string;
  ttl: number;
  priority?: number;
  proxied?: boolean;
}

export interface DnsRecordInput {
  type: DnsRecord['type'];
  name: string;
  content: string;
  ttl?: number;
  priority?: number;
  proxied?: boolean;
}

// Hosting Provider Types
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

export interface FileInfo {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modifiedAt?: Date;
}

export interface UploadOptions {
  overwrite?: boolean;
  preserveTimestamps?: boolean;
  concurrency?: number;
}

export interface UploadResult {
  filesUploaded: number;
  bytesUploaded: number;
  errors: string[];
}

export interface UploadProgress {
  currentFile: string;
  filesUploaded: number;
  totalFiles: number;
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
}

export interface DeployOptions {
  backup?: boolean;
  clearDestination?: boolean;
  skipHtaccess?: boolean;
  purgeCdn?: boolean;
}

export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  filesUploaded: number;
  url?: string;
  backupPath?: string;
}

// CDN Provider Types
export interface CDNZone {
  id: string;
  name: string;
  domain: string;
  status: string;
  paused: boolean;
  createdAt: Date;
}

export interface PurgeCacheOptions {
  files?: string[];
  tags?: string[];
  prefixes?: string[];
}

export type SSLMode = 'off' | 'flexible' | 'full' | 'full_strict';

export interface SSLStatus {
  enabled: boolean;
  mode: SSLMode;
  certificateAuthority?: string;
  expiresAt?: Date;
  issuer?: string;
}

export interface CDNSettings {
  minify: {
    javascript: boolean;
    css: boolean;
    html: boolean;
  };
  caching: {
    level: 'bypass' | 'basic' | 'simplified' | 'aggressive';
    ttl: number;
  };
  security: {
    securityLevel: 'off' | 'low' | 'medium' | 'high' | 'under_attack';
    browserCheck: boolean;
  };
}

export interface CDNAnalytics {
  requests: number;
  bandwidth: number;
  cachedRequests: number;
  uniqueVisitors: number;
  period: string;
}

// Hosting Provider Models
export interface HostingProvider {
  id: string;
  name: string;
  type: 'sftp' | 'cpanel' | 'plesk' | 'vercel' | 'netlify' | 's3';
  credentials: HostingCredentials;
  isActive: boolean;
  lastTestedAt?: Date;
  lastTestResult?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HostingCredentials =
  | SFTPCredentials
  | CPanelCredentials
  | VercelCredentials
  | NetlifyCredentials
  | S3Credentials;

export interface SFTPCredentials {
  type: 'sftp';
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
}

export interface CPanelCredentials {
  type: 'cpanel';
  host: string;
  port: number;
  username: string;
  apiToken: string;
}

export interface VercelCredentials {
  type: 'vercel';
  apiToken: string;
  teamId?: string;
}

export interface NetlifyCredentials {
  type: 'netlify';
  apiToken: string;
  siteId?: string;
}

export interface S3Credentials {
  type: 's3';
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

// CDN Provider Models
export interface CDNProvider {
  id: string;
  name: string;
  type: 'cloudflare' | 'bunny' | 'fastly';
  credentials: CDNCredentials;
  accountId?: string;
  isActive: boolean;
  lastTestedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CDNCredentials = CloudflareCredentials | BunnyCDNCredentials;

export interface CloudflareCredentials {
  type: 'cloudflare';
  apiToken: string;
  accountId?: string;
}

export interface BunnyCDNCredentials {
  type: 'bunny';
  apiKey: string;
}

// Domain Registrar Models
export interface DomainRegistrar {
  id: string;
  name: string;
  type: 'cloudflare' | 'namecheap' | 'godaddy';
  credentials: RegistrarCredentials;
  accountId?: string;
  accountEmail?: string;
  isActive: boolean;
  lastTestedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type RegistrarCredentials =
  | CloudflareRegistrarCredentials
  | NamecheapCredentials
  | GoDaddyCredentials;

export interface CloudflareRegistrarCredentials {
  type: 'cloudflare';
  apiToken: string;
  accountId: string;
}

export interface NamecheapCredentials {
  type: 'namecheap';
  apiUser: string;
  apiKey: string;
  username: string;
  clientIp: string;
}

export interface GoDaddyCredentials {
  type: 'godaddy';
  apiKey: string;
  apiSecret: string;
}

// Deployment Model
export interface Deployment {
  id: string;
  generationId?: string;
  version: number;
  providerId: string;
  targetPath: string;
  deployedUrl?: string;
  status: DeploymentStatus;
  progress: number;
  filesUploaded: number;
  totalFiles: number;
  deploymentLog?: DeploymentLogEntry[];
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DeploymentStatus =
  | 'pending'
  | 'uploading'
  | 'completed'
  | 'failed'
  | 'rolled-back';

export interface DeploymentLogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
}

// API Input Types
export interface CreateHostingProviderInput {
  name: string;
  type: HostingProvider['type'];
  credentials: HostingCredentials;
}

export interface CreateCDNProviderInput {
  name: string;
  type: CDNProvider['type'];
  credentials: CDNCredentials;
}

export interface CreateDomainRegistrarInput {
  name: string;
  type: DomainRegistrar['type'];
  credentials: RegistrarCredentials;
}

export interface StartDeploymentInput {
  projectId: string;
  generationId?: string;
  providerId: string;
  targetPath: string;
  options?: DeployOptions;
}
