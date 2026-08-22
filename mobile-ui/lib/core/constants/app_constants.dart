class AppConstants {
  static const String appName = 'UrbanEco-Link';
  static const String appTagline = 'Smart Bulk Waste Streamlining & Processing';
  static const String swmRuleLabel = 'SWM Rules 2026';

  // Role Constants
  static const String roleSociety = 'SOCIETY_INDIVIDUAL';
  static const String roleNGO = 'NGO';
  static const String roleFactory = 'FACTORY';
  static const String roleDriver = 'DELIVERY_PARTNER';

  // Waste Stream Categories
  static const String streamWet = 'WET';
  static const String streamDry = 'DRY';
  static const String streamHazardous = 'HAZARDOUS';
  static const String streamSanitary = 'SANITARY';

  // Factory Status Values
  static const String statusOperational = 'OPERATIONAL';
  static const String statusBusy = 'BUSY';
  static const String statusLimited = 'LIMITED_CAPACITY';
  static const String statusFull = 'FULL_CAPACITY';
  static const String statusMaintenance = 'UNDER_MAINTENANCE';
  static const String statusEmergency = 'EMERGENCY_SHUTDOWN';

  // Pickup Status Values
  static const String pickupRequested = 'REQUESTED';
  static const String pickupForecasted = 'FORECASTED';
  static const String pickupConfirmed = 'CONFIRMED';
  static const String pickupAssigned = 'ASSIGNED';
  static const String pickupInTransit = 'IN_TRANSIT';
  static const String pickupArrivedFactory = 'ARRIVED_FACTORY';
  static const String pickupCompleted = 'COMPLETED';
  static const String pickupCancelled = 'CANCELLED';

  // Processing Status Values
  static const String processPending = 'PENDING';
  static const String processInProcessing = 'IN_PROCESSING';
  static const String processPaused = 'PAUSED';
  static const String processCompleted = 'COMPLETED';
}
