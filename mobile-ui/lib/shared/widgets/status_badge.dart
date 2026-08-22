import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final Color textColor;
  final Color backgroundColor;
  final Color? borderColor;
  final IconData? icon;

  const StatusBadge({
    super.key,
    required this.label,
    required this.textColor,
    required this.backgroundColor,
    this.borderColor,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
        border: borderColor != null
            ? Border.all(color: borderColor!, width: 1)
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: textColor),
            const SizedBox(width: 4),
          ],
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: AppTypography.caption,
                fontWeight: FontWeight.w700,
                color: textColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Factory status badge widget helper
  factory StatusBadge.factoryStatus(String status) {
    switch (status) {
      case AppConstants.statusOperational:
        return const StatusBadge(
          label: 'Operational',
          textColor: AppColors.statusOperationalText,
          backgroundColor: AppColors.statusOperationalBg,
          icon: Icons.check_circle_outline,
        );
      case AppConstants.statusBusy:
        return const StatusBadge(
          label: 'Busy',
          textColor: AppColors.statusBusyText,
          backgroundColor: AppColors.statusBusyBg,
          icon: Icons.access_time,
        );
      case AppConstants.statusLimited:
        return const StatusBadge(
          label: 'Limited Capacity',
          textColor: AppColors.statusLimitedText,
          backgroundColor: AppColors.statusLimitedBg,
          icon: Icons.warning_amber_rounded,
        );
      case AppConstants.statusFull:
        return const StatusBadge(
          label: 'Full Capacity',
          textColor: AppColors.statusFullText,
          backgroundColor: AppColors.statusFullBg,
          icon: Icons.block,
        );
      case AppConstants.statusMaintenance:
        return const StatusBadge(
          label: 'Under Maintenance',
          textColor: AppColors.statusMaintenanceText,
          backgroundColor: AppColors.statusMaintenanceBg,
          icon: Icons.build_circle_outlined,
        );
      case AppConstants.statusEmergency:
        return const StatusBadge(
          label: 'EMERGENCY SHUTDOWN',
          textColor: Colors.white,
          backgroundColor: AppColors.statusEmergencyBg,
          icon: Icons.error_outline,
        );
      default:
        return StatusBadge(
          label: status,
          textColor: AppColors.neutralDark,
          backgroundColor: AppColors.borderLight,
        );
    }
  }

  /// Waste stream category badge helper
  factory StatusBadge.streamCategory(String category) {
    switch (category) {
      case AppConstants.streamWet:
        return const StatusBadge(
          label: 'Wet Organic',
          textColor: AppColors.streamWetText,
          backgroundColor: AppColors.streamWetBg,
          icon: Icons.compost,
        );
      case AppConstants.streamDry:
        return const StatusBadge(
          label: 'Dry Recyclables',
          textColor: AppColors.streamDryText,
          backgroundColor: AppColors.streamDryBg,
          icon: Icons.inventory_2_outlined,
        );
      case AppConstants.streamHazardous:
        return const StatusBadge(
          label: 'Hazardous / E-Waste',
          textColor: AppColors.streamHazardousText,
          backgroundColor: AppColors.streamHazardousBg,
          icon: Icons.warning,
        );
      case AppConstants.streamSanitary:
        return const StatusBadge(
          label: 'Sanitary',
          textColor: AppColors.streamSanitaryText,
          backgroundColor: AppColors.streamSanitaryBg,
          icon: Icons.clean_hands_outlined,
        );
      default:
        return StatusBadge(
          label: category,
          textColor: AppColors.neutralDark,
          backgroundColor: AppColors.borderLight,
        );
    }
  }

  /// Pickup status badge helper with human-readable mobile labels (no raw backend jargon)
  factory StatusBadge.pickupStatus(String status) {
    switch (status) {
      case AppConstants.pickupRequested:
        return const StatusBadge(
          label: 'Requested',
          textColor: AppColors.infoText,
          backgroundColor: AppColors.infoBg,
        );
      case AppConstants.pickupForecasted:
        return const StatusBadge(
          label: 'Forecasted',
          textColor: AppColors.warningText,
          backgroundColor: AppColors.warningBg,
        );
      case AppConstants.pickupConfirmed:
        return const StatusBadge(
          label: 'Confirmed',
          textColor: AppColors.successText,
          backgroundColor: AppColors.successBg,
        );
      case AppConstants.pickupAssigned:
        return const StatusBadge(
          label: 'Driver Assigned',
          textColor: AppColors.infoText,
          backgroundColor: AppColors.infoBg,
        );
      case AppConstants.pickupInTransit:
        return const StatusBadge(
          label: 'In Transit',
          textColor: Color(0xFF4F46E5),
          backgroundColor: Color(0xFFEEF2FF),
          icon: Icons.local_shipping_outlined,
        );
      case AppConstants.pickupArrivedFactory:
        return const StatusBadge(
          label: 'At Factory',
          textColor: Color(0xFF0D9488),
          backgroundColor: Color(0xFFCCFBF1),
        );
      case AppConstants.pickupCompleted:
        return const StatusBadge(
          label: 'Completed',
          textColor: AppColors.successText,
          backgroundColor: AppColors.successBg,
          icon: Icons.check_circle,
        );
      case AppConstants.processInProcessing:
        return const StatusBadge(
          label: 'Processing',
          textColor: Color(0xFF0D9488),
          backgroundColor: Color(0xFFCCFBF1),
          icon: Icons.autorenew,
        );
      case AppConstants.processPending:
        return const StatusBadge(
          label: 'Pending Intake',
          textColor: AppColors.warningText,
          backgroundColor: AppColors.warningBg,
        );
      case AppConstants.processPaused:
        return const StatusBadge(
          label: 'Paused',
          textColor: AppColors.warningText,
          backgroundColor: AppColors.warningBg,
          icon: Icons.pause_circle_outline,
        );
      default:
        return StatusBadge(
          label: status == 'IN_PROCESSING' ? 'Processing' : status,
          textColor: AppColors.neutralDark,
          backgroundColor: AppColors.borderLight,
        );
    }
  }
}
