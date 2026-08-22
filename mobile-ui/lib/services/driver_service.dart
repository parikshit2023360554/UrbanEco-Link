import 'package:flutter/foundation.dart';
import '../core/constants/app_constants.dart';
import '../shared/models/models.dart';

class DriverService extends ChangeNotifier {
  final List<BatchAssignmentModel> _assignments = [
    BatchAssignmentModel(
      id: 'BAT-7001',
      batchCode: 'BATCH-WET-901',
      driverId: 'DRV-404',
      driverName: 'Vikram Singh',
      vehicleNo: 'KA-01-EV-2026',
      streamCategory: AppConstants.streamWet,
      totalWeightKg: 420.0,
      originSociety: 'Greenwood Heights RWA',
      pickupAddress: 'Gate 2 Main Collection Yard, Sector 62',
      destinationFactoryId: 'FAC-01',
      destinationFactoryName: 'EcoMatrix Processing Facility #4',
      etaMinutes: '18 mins',
      priority: 'HIGH',
      status: AppConstants.pickupInTransit,
      qrCodeToken: 'QR_WET_89234',
      createdAt: '2026-08-09T08:00:00Z',
    ),
    BatchAssignmentModel(
      id: 'BAT-7002',
      batchCode: 'BATCH-DRY-902',
      driverId: 'DRV-404',
      driverName: 'Vikram Singh',
      vehicleNo: 'KA-01-EV-2026',
      streamCategory: AppConstants.streamDry,
      totalWeightKg: 310.0,
      originSociety: 'SilverOak Towers RWA',
      pickupAddress: 'Block A Parking Bay, Sector 60',
      destinationFactoryId: 'FAC-01',
      destinationFactoryName: 'EcoMatrix Processing Facility #4',
      etaMinutes: '35 mins',
      priority: 'MEDIUM',
      status: AppConstants.pickupAssigned,
      qrCodeToken: 'QR_DRY_99120',
      createdAt: '2026-08-09T08:30:00Z',
    ),
    BatchAssignmentModel(
      id: 'BAT-6980',
      batchCode: 'BATCH-WET-889',
      driverId: 'DRV-404',
      driverName: 'Vikram Singh',
      vehicleNo: 'KA-01-EV-2026',
      streamCategory: AppConstants.streamWet,
      totalWeightKg: 510.0,
      originSociety: 'SunCity Apartments',
      pickupAddress: 'Service Road Gate 3',
      destinationFactoryId: 'FAC-01',
      destinationFactoryName: 'EcoMatrix Processing Facility #4',
      etaMinutes: 'Completed',
      priority: 'HIGH',
      status: AppConstants.pickupCompleted,
      qrCodeToken: 'QR_WET_77102',
      createdAt: '2026-08-08T14:00:00Z',
    ),
  ];

  List<BatchAssignmentModel> get assignments => _assignments;

  BatchAssignmentModel? get activeAssignment => _assignments.firstWhere(
        (a) => a.status == AppConstants.pickupInTransit || a.status == AppConstants.pickupAssigned,
        orElse: () => _assignments.first,
      );

  bool scanQrToken(String token) {
    final index = _assignments.indexWhere((a) => a.qrCodeToken.trim() == token.trim());
    if (index != -1) {
      _assignments[index].status = AppConstants.pickupInTransit;
      notifyListeners();
      return true;
    }
    return false;
  }

  void markArrivedAtFactory(String assignmentId) {
    final index = _assignments.indexWhere((a) => a.id == assignmentId);
    if (index != -1) {
      _assignments[index].status = AppConstants.pickupArrivedFactory;
      notifyListeners();
    }
  }

  void markCompleted(String assignmentId) {
    final index = _assignments.indexWhere((a) => a.id == assignmentId);
    if (index != -1) {
      _assignments[index].status = AppConstants.pickupCompleted;
      notifyListeners();
    }
  }
}
