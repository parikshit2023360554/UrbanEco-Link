import 'package:flutter/foundation.dart';
import '../core/constants/app_constants.dart';
import '../shared/models/models.dart';

class SocietyService extends ChangeNotifier {
  final List<WasteForecastModel> _forecasts = [
    WasteForecastModel(
      id: 'FC-8801',
      societyId: 'SOC-101',
      societyName: 'Greenwood Heights RWA',
      streamCategory: AppConstants.streamWet,
      predictedWeightKg: 450.0,
      confidencePercentage: 94,
      predictedDate: 'Today, 2:30 PM',
      predictedTimeSlot: '14:00 - 16:00',
      isConfirmed: false,
    ),
    WasteForecastModel(
      id: 'FC-8802',
      societyId: 'SOC-101',
      societyName: 'Greenwood Heights RWA',
      streamCategory: AppConstants.streamDry,
      predictedWeightKg: 280.0,
      confidencePercentage: 89,
      predictedDate: 'Tomorrow, 10:00 AM',
      predictedTimeSlot: '10:00 - 12:00',
      isConfirmed: false,
    ),
  ];

  final List<PickupRequestModel> _pickups = [
    PickupRequestModel(
      id: 'PU-9001',
      societyId: 'SOC-101',
      societyName: 'Greenwood Heights RWA',
      address: 'Gate 2, Greenwood Campus, Sector 62',
      streamCategory: AppConstants.streamWet,
      weightKg: 420.0,
      requestedDate: '2026-08-09',
      timeSlot: '09:00 AM - 11:00 AM',
      priority: 'HIGH',
      status: AppConstants.pickupInTransit,
      assignedDriverId: 'DRV-404',
      assignedDriverName: 'Vikram Singh',
      vehicleNo: 'KA-01-EV-2026',
      qrCodeToken: 'QR_WET_89234',
      destinationFactoryId: 'FAC-01',
      destinationFactoryName: 'EcoMatrix Processing Facility #4',
      createdAt: '2026-08-09T08:00:00Z',
    ),
    PickupRequestModel(
      id: 'PU-9002',
      societyId: 'SOC-101',
      societyName: 'Greenwood Heights RWA',
      address: 'Gate 1, Main Clubhouse',
      streamCategory: AppConstants.streamDry,
      weightKg: 310.0,
      requestedDate: '2026-08-09',
      timeSlot: '02:00 PM - 04:00 PM',
      priority: 'MEDIUM',
      status: AppConstants.pickupAssigned,
      assignedDriverId: 'DRV-404',
      assignedDriverName: 'Vikram Singh',
      vehicleNo: 'KA-01-EV-2026',
      qrCodeToken: 'QR_DRY_99120',
      destinationFactoryId: 'FAC-01',
      destinationFactoryName: 'EcoMatrix Processing Facility #4',
      createdAt: '2026-08-09T08:30:00Z',
    ),
    PickupRequestModel(
      id: 'PU-8910',
      societyId: 'SOC-101',
      societyName: 'Greenwood Heights RWA',
      address: 'Gate 2, Greenwood Campus',
      streamCategory: AppConstants.streamHazardous,
      weightKg: 85.0,
      requestedDate: '2026-08-07',
      timeSlot: '11:00 AM - 01:00 PM',
      priority: 'HIGH',
      status: AppConstants.pickupCompleted,
      assignedDriverId: 'DRV-102',
      assignedDriverName: 'Anil Sharma',
      vehicleNo: 'KA-05-EV-1122',
      qrCodeToken: 'QR_HAZ_77211',
      destinationFactoryId: 'FAC-02',
      destinationFactoryName: 'CleanTech E-Waste Recycler',
      createdAt: '2026-08-07T09:00:00Z',
    ),
  ];

  final List<RewardItemModel> _rewards = [
    RewardItemModel(
      id: 'REW-01',
      title: '50kg Organic Bio-Compost Bag',
      description: 'High grade nutrient compost for society garden & landscaping',
      pointsRequired: 250,
      category: 'Compost',
    ),
    RewardItemModel(
      id: 'REW-02',
      title: 'Municipal Property Tax Credit Voucher',
      description: '₹1,000 deduction voucher on annual civic property tax',
      pointsRequired: 500,
      category: 'Tax Rebate',
    ),
    RewardItemModel(
      id: 'REW-03',
      title: 'Eco-Champion Certificate & Plaque',
      description: 'Official SWM 2026 Compliance recognition from Municipal Corp',
      pointsRequired: 750,
      category: 'Recognition',
    ),
  ];

  TrustGradeModel _trustGrade = TrustGradeModel(
    score: 94,
    grade: 'Grade A+',
    complianceRatePercent: 98.2,
    segregationAccuracyPercent: 95.6,
    totalPickupsCompleted: 148,
    badgeName: 'Zero-Waste Pioneer RWA',
  );

  List<WasteForecastModel> get forecasts => _forecasts;
  List<PickupRequestModel> get pickups => _pickups;
  List<RewardItemModel> get rewards => _rewards;
  TrustGradeModel get trustGrade => _trustGrade;

  int get rewardPointsBalance => 680;

  /// Confirm AI Forecast -> Creates real pickup request
  /// IMPORTANT BUSINESS RULE: Prediction DOES NOT automatically create batch;
  /// Society MUST confirm it first.
  void confirmForecast(String forecastId, {double? editedWeight, String? editedTime}) {
    final index = _forecasts.indexWhere((f) => f.id == forecastId);
    if (index != -1) {
      final forecast = _forecasts[index];
      forecast.isConfirmed = true;
      if (editedWeight != null) forecast.editedWeightKg = editedWeight;
      if (editedTime != null) forecast.editedTimeSlot = editedTime;

      // Generate real pickup request from confirmed forecast
      final newPickup = PickupRequestModel(
        id: 'PU-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        societyId: forecast.societyId,
        societyName: forecast.societyName,
        address: 'Gate 2 Main Collection Yard',
        streamCategory: forecast.streamCategory,
        weightKg: editedWeight ?? forecast.predictedWeightKg,
        requestedDate: 'Today',
        timeSlot: editedTime ?? forecast.predictedTimeSlot,
        priority: 'MEDIUM',
        status: AppConstants.pickupRequested,
        qrCodeToken: 'QR_${forecast.streamCategory}_${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
        createdAt: DateTime.now().toIso8601String(),
      );

      _pickups.insert(0, newPickup);
      notifyListeners();
    }
  }

  void cancelForecast(String forecastId) {
    final index = _forecasts.indexWhere((f) => f.id == forecastId);
    if (index != -1) {
      _forecasts[index].isCancelled = true;
      notifyListeners();
    }
  }

  void requestPickup({
    required String streamCategory,
    required double weightKg,
    required String requestedDate,
    required String timeSlot,
    required String address,
    String priority = 'MEDIUM',
  }) {
    final newPickup = PickupRequestModel(
      id: 'PU-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      societyId: 'SOC-101',
      societyName: 'Greenwood Heights RWA',
      address: address,
      streamCategory: streamCategory,
      weightKg: weightKg,
      requestedDate: requestedDate,
      timeSlot: timeSlot,
      priority: priority,
      status: AppConstants.pickupRequested,
      qrCodeToken: 'QR_${streamCategory}_${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
      createdAt: DateTime.now().toIso8601String(),
    );

    _pickups.insert(0, newPickup);
    notifyListeners();
  }

  void redeemReward(String rewardId) {
    final index = _rewards.indexWhere((r) => r.id == rewardId);
    if (index != -1) {
      _rewards[index].isRedeemed = true;
      notifyListeners();
    }
  }
}
