import '../../core/constants/app_constants.dart';

/// User Domain Model
class UserModel {
  final String id;
  final String name;
  final String email;
  final String role; // SOCIETY_INDIVIDUAL, NGO, FACTORY, DELIVERY_PARTNER
  final String phone;
  final String? organizationName;
  final String? address;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.phone,
    this.organizationName,
    this.address,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? AppConstants.roleSociety,
      phone: json['phone'] ?? '',
      organizationName: json['organization_name'] ?? json['society_name'],
      address: json['address'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'role': role,
        'phone': phone,
        'organization_name': organizationName,
        'address': address,
      };
}

/// Waste Forecast Model (AI Prediction -> Society Confirmation)
class WasteForecastModel {
  final String id;
  final String societyId;
  final String societyName;
  final String streamCategory; // WET, DRY, HAZARDOUS
  final double predictedWeightKg;
  final int confidencePercentage;
  final String predictedDate;
  final String predictedTimeSlot;
  bool isConfirmed;
  bool isCancelled;
  double? editedWeightKg;
  String? editedTimeSlot;

  WasteForecastModel({
    required this.id,
    required this.societyId,
    required this.societyName,
    required this.streamCategory,
    required this.predictedWeightKg,
    required this.confidencePercentage,
    required this.predictedDate,
    required this.predictedTimeSlot,
    this.isConfirmed = false,
    this.isCancelled = false,
    this.editedWeightKg,
    this.editedTimeSlot,
  });
}

/// Pickup Request Model
class PickupRequestModel {
  final String id;
  final String societyId;
  final String societyName;
  final String address;
  final String streamCategory;
  final double weightKg;
  final String requestedDate;
  final String timeSlot;
  final String priority; // HIGH, MEDIUM, LOW
  String status; // REQUESTED, ASSIGNED, IN_TRANSIT, ARRIVED_FACTORY, COMPLETED
  final String? assignedDriverId;
  final String? assignedDriverName;
  final String? vehicleNo;
  final String qrCodeToken;
  final String? destinationFactoryId;
  final String? destinationFactoryName;
  final String createdAt;

  PickupRequestModel({
    required this.id,
    required this.societyId,
    required this.societyName,
    required this.address,
    required this.streamCategory,
    required this.weightKg,
    required this.requestedDate,
    required this.timeSlot,
    this.priority = 'MEDIUM',
    required this.status,
    this.assignedDriverId,
    this.assignedDriverName,
    this.vehicleNo,
    required this.qrCodeToken,
    this.destinationFactoryId,
    this.destinationFactoryName,
    required this.createdAt,
  });
}

/// Batch Assignment Model (Driver View & Factory Incoming)
class BatchAssignmentModel {
  final String id;
  final String batchCode;
  final String driverId;
  final String driverName;
  final String vehicleNo;
  final String streamCategory;
  final double totalWeightKg;
  final String originSociety;
  final String pickupAddress;
  final String destinationFactoryId;
  final String destinationFactoryName;
  final String etaMinutes;
  final String priority;
  String status; // PENDING_PICKUP, IN_TRANSIT, ARRIVED, DELIVERED, PROCESSING, COMPLETED
  final String qrCodeToken;
  final String createdAt;

  BatchAssignmentModel({
    required this.id,
    required this.batchCode,
    required this.driverId,
    required this.driverName,
    required this.vehicleNo,
    required this.streamCategory,
    required this.totalWeightKg,
    required this.originSociety,
    required this.pickupAddress,
    required this.destinationFactoryId,
    required this.destinationFactoryName,
    required this.etaMinutes,
    required this.priority,
    required this.status,
    required this.qrCodeToken,
    required this.createdAt,
  });
}

/// Factory Capacity Model with Auto-Calculated Remaining Capacity
class FactoryCapacityModel {
  final double maxCapacityKg;
  double todayAvailableCapacityKg;
  double reservedCapacityKg;

  FactoryCapacityModel({
    required this.maxCapacityKg,
    required this.todayAvailableCapacityKg,
    required this.reservedCapacityKg,
  });

  /// Remaining Capacity is dynamically calculated as Today Available - Reserved
  double get remainingCapacityKg {
    final rem = todayAvailableCapacityKg - reservedCapacityKg;
    return rem < 0 ? 0 : rem;
  }

  double get utilizationPercentage {
    if (todayAvailableCapacityKg <= 0) return 100.0;
    final pct = (reservedCapacityKg / todayAvailableCapacityKg) * 100;
    return pct > 100 ? 100.0 : pct;
  }
}

/// Factory Status Configuration Model
class FactoryStatusConfigModel {
  String status; // OPERATIONAL, BUSY, LIMITED_CAPACITY, FULL_CAPACITY, UNDER_MAINTENANCE, EMERGENCY_SHUTDOWN
  String? maintenanceStart;
  String? expectedRecovery;
  String notes;
  String updatedAt;

  FactoryStatusConfigModel({
    required this.status,
    this.maintenanceStart,
    this.expectedRecovery,
    this.notes = '',
    required this.updatedAt,
  });

  bool get isAcceptingAssignments {
    return status != AppConstants.statusFull &&
        status != AppConstants.statusMaintenance &&
        status != AppConstants.statusEmergency;
  }
}

/// Factory Batch Processing Log Model (Material Recovery Balance)
class BatchProcessingLogModel {
  final String id;
  final String batchCode;
  final String streamCategory;
  final double receivedWeightKg;
  double processedWeightKg;
  double rejectWeightKg;
  String processingStatus; // PENDING, IN_PROCESSING, PAUSED, COMPLETED
  final String receivedAt;
  String? completedAt;

  BatchProcessingLogModel({
    required this.id,
    required this.batchCode,
    required this.streamCategory,
    required this.receivedWeightKg,
    this.processedWeightKg = 0,
    this.rejectWeightKg = 0,
    required this.processingStatus,
    required this.receivedAt,
    this.completedAt,
  });

  double get recoveryRatePercentage {
    if (receivedWeightKg <= 0) return 0;
    return (processedWeightKg / receivedWeightKg) * 100;
  }
}

/// Society Reward Item Model
class RewardItemModel {
  final String id;
  final String title;
  final String description;
  final int pointsRequired;
  final String category; // Compost, Vouchers, Tax Rebate
  bool isRedeemed;

  RewardItemModel({
    required this.id,
    required this.title,
    required this.description,
    required this.pointsRequired,
    required this.category,
    this.isRedeemed = false,
  });
}

/// Society Trust Score & Grade Model
class TrustGradeModel {
  final int score; // e.g. 92 / 100
  final String grade; // Grade A+, Grade A, Grade B
  final double complianceRatePercent;
  final double segregationAccuracyPercent;
  final int totalPickupsCompleted;
  final String badgeName;

  TrustGradeModel({
    required this.score,
    required this.grade,
    required this.complianceRatePercent,
    required this.segregationAccuracyPercent,
    required this.totalPickupsCompleted,
    required this.badgeName,
  });
}

/// App Notification Model
class AppNotificationModel {
  final String id;
  final String title;
  final String message;
  final String type; // PICKUP, FORECAST, DRIVER, FACTORY, ALERT
  final String timestamp;
  bool isRead;

  AppNotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.timestamp,
    this.isRead = false,
  });
}
