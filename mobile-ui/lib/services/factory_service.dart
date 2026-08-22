import 'package:flutter/foundation.dart';
import '../core/constants/app_constants.dart';
import '../shared/models/models.dart';

class FactoryService extends ChangeNotifier {
  final FactoryCapacityModel _capacity = FactoryCapacityModel(
    maxCapacityKg: 5000.0,
    todayAvailableCapacityKg: 4200.0,
    reservedCapacityKg: 1850.0,
  );

  final FactoryStatusConfigModel _statusConfig = FactoryStatusConfigModel(
    status: AppConstants.statusOperational,
    maintenanceStart: null,
    expectedRecovery: null,
    notes: 'Operating at normal processing throughput',
    updatedAt: DateTime.now().toIso8601String(),
  );

  final List<BatchAssignmentModel> _incomingBatches = [
    BatchAssignmentModel(
      id: 'BAT-7001',
      batchCode: 'BATCH-WET-901',
      driverId: 'DRV-404',
      driverName: 'Vikram Singh',
      vehicleNo: 'KA-01-EV-2026',
      streamCategory: AppConstants.streamWet,
      totalWeightKg: 420.0,
      originSociety: 'Greenwood Heights RWA',
      pickupAddress: 'Gate 2 Main Yard',
      destinationFactoryId: 'FAC-01',
      destinationFactoryName: 'EcoMatrix Facility #4',
      etaMinutes: '15 mins',
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
      pickupAddress: 'Block A Parking Bay',
      destinationFactoryId: 'FAC-01',
      destinationFactoryName: 'EcoMatrix Facility #4',
      etaMinutes: '35 mins',
      priority: 'MEDIUM',
      status: AppConstants.pickupInTransit,
      qrCodeToken: 'QR_DRY_99120',
      createdAt: '2026-08-09T08:30:00Z',
    ),
  ];

  final List<BatchProcessingLogModel> _processingLogs = [
    BatchProcessingLogModel(
      id: 'PROC-101',
      batchCode: 'BATCH-WET-889',
      streamCategory: AppConstants.streamWet,
      receivedWeightKg: 510.0,
      processedWeightKg: 475.0,
      rejectWeightKg: 35.0,
      processingStatus: AppConstants.processCompleted,
      receivedAt: '2026-08-08T15:30:00Z',
      completedAt: '2026-08-08T18:00:00Z',
    ),
    BatchProcessingLogModel(
      id: 'PROC-102',
      batchCode: 'BATCH-DRY-880',
      streamCategory: AppConstants.streamDry,
      receivedWeightKg: 340.0,
      processedWeightKg: 310.0,
      rejectWeightKg: 30.0,
      processingStatus: AppConstants.processInProcessing,
      receivedAt: '2026-08-09T07:15:00Z',
    ),
  ];

  FactoryCapacityModel get capacity => _capacity;
  FactoryStatusConfigModel get statusConfig => _statusConfig;
  List<BatchAssignmentModel> get incomingBatches => _incomingBatches;
  List<BatchProcessingLogModel> get processingLogs => _processingLogs;

  /// Update today's available capacity by factory manager
  void updateTodayAvailableCapacity(double newAvailableKg) {
    _capacity.todayAvailableCapacityKg = newAvailableKg;
    notifyListeners();
  }

  /// Update factory operational status
  void updateFactoryStatus(
    String newStatus, {
    String? maintenanceStart,
    String? expectedRecovery,
    String notes = '',
  }) {
    _statusConfig.status = newStatus;
    _statusConfig.maintenanceStart = maintenanceStart;
    _statusConfig.expectedRecovery = expectedRecovery;
    _statusConfig.notes = notes;
    _statusConfig.updatedAt = DateTime.now().toIso8601String();
    notifyListeners();
  }

  /// Receive incoming batch via QR code scan or weighbridge intake
  bool receiveBatch(String qrToken) {
    final index = _incomingBatches.indexWhere((b) => b.qrCodeToken.trim() == qrToken.trim());
    if (index != -1) {
      final batch = _incomingBatches[index];
      batch.status = AppConstants.pickupArrivedFactory;

      // Add to active processing logs
      _processingLogs.insert(
        0,
        BatchProcessingLogModel(
          id: 'PROC-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
          batchCode: batch.batchCode,
          streamCategory: batch.streamCategory,
          receivedWeightKg: batch.totalWeightKg,
          processingStatus: AppConstants.processPending,
          receivedAt: DateTime.now().toIso8601String(),
        ),
      );

      _incomingBatches.removeAt(index);
      notifyListeners();
      return true;
    }
    return false;
  }

  /// Update processing state (Start, Pause, Resume, Complete)
  void updateProcessingStatus(String logId, String newStatus) {
    final index = _processingLogs.indexWhere((p) => p.id == logId);
    if (index != -1) {
      _processingLogs[index].processingStatus = newStatus;
      notifyListeners();
    }
  }

  /// Complete batch processing with material recovery & residue weights
  void completeProcessing(String logId, double recoveredWeightKg, double rejectWeightKg) {
    final index = _processingLogs.indexWhere((p) => p.id == logId);
    if (index != -1) {
      final log = _processingLogs[index];
      log.processedWeightKg = recoveredWeightKg;
      log.rejectWeightKg = rejectWeightKg;
      log.processingStatus = AppConstants.processCompleted;
      log.completedAt = DateTime.now().toIso8601String();
      notifyListeners();
    }
  }
}
