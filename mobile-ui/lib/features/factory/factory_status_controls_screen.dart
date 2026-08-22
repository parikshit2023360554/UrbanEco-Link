import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../services/factory_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_text_field.dart';

class FactoryStatusControlsScreen extends StatefulWidget {
  const FactoryStatusControlsScreen({super.key});

  @override
  State<FactoryStatusControlsScreen> createState() => _FactoryStatusControlsScreenState();
}

class _FactoryStatusControlsScreenState extends State<FactoryStatusControlsScreen> {
  late String _selectedStatus;
  final _maintStartController = TextEditingController(text: 'Today 14:00');
  final _expRecoveryController = TextEditingController(text: 'Tomorrow 08:00');
  final _notesController = TextEditingController(text: 'Scheduled conveyor belt calibration');

  final List<Map<String, dynamic>> _statusOptions = [
    {
      'id': AppConstants.statusOperational,
      'label': 'Operational',
      'sub': 'Accept waste normally',
      'icon': LucideIcons.checkCircle2,
      'color': AppColors.statusOperationalText,
    },
    {
      'id': AppConstants.statusBusy,
      'label': 'Busy',
      'sub': 'Accept with queue delay consideration',
      'icon': LucideIcons.clock,
      'color': AppColors.statusBusyText,
    },
    {
      'id': AppConstants.statusLimited,
      'label': 'Limited Capacity',
      'sub': 'Reduced availability for incoming trucks',
      'icon': LucideIcons.alertTriangle,
      'color': AppColors.statusLimitedText,
    },
    {
      'id': AppConstants.statusFull,
      'label': 'Full Capacity',
      'sub': 'Do not assign new waste batches',
      'icon': Icons.block,
      'color': AppColors.statusFullText,
    },
    {
      'id': AppConstants.statusMaintenance,
      'label': 'Under Maintenance',
      'sub': 'Do not assign. Requires start & recovery window',
      'icon': LucideIcons.wrench,
      'color': AppColors.statusMaintenanceText,
    },
    {
      'id': AppConstants.statusEmergency,
      'label': 'EMERGENCY SHUTDOWN',
      'sub': 'Stop all intake immediately. Reject new assignments!',
      'icon': LucideIcons.alertOctagon,
      'color': AppColors.statusEmergencyBg,
    },
  ];

  @override
  void initState() {
    super.initState();
    _selectedStatus = context.read<FactoryService>().statusConfig.status;
  }

  @override
  void dispose() {
    _maintStartController.dispose();
    _expRecoveryController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _confirmEmergencyShutdown() {
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: const [
              Icon(LucideIcons.alertOctagon, color: AppColors.dangerText, size: 24),
              SizedBox(width: 8),
              Text('Confirm Emergency Shutdown', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'WARNING: Emergency shutdown immediately blocks all incoming truck dispatches across the municipal network.',
                style: TextStyle(fontSize: 12, color: AppColors.neutralDark, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 14),
              AppTextField(
                label: 'Emergency Reason / Notes',
                hint: 'e.g. Hazardous chemical spill or power failure',
                controller: reasonController,
                maxLines: 2,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: AppColors.neutralGray)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.dangerText),
              onPressed: () {
                Navigator.pop(ctx);
                _executeStatusSave(reasonController.text.trim());
              },
              child: const Text('CONFIRM SHUTDOWN', style: TextStyle(fontWeight: FontWeight.w800)),
            ),
          ],
        );
      },
    );
  }

  void _executeStatusSave([String? extraNotes]) {
    final factoryService = context.read<FactoryService>();

    factoryService.updateFactoryStatus(
      _selectedStatus,
      maintenanceStart: _selectedStatus == AppConstants.statusMaintenance ? _maintStartController.text : null,
      expectedRecovery: _selectedStatus == AppConstants.statusMaintenance ? _expRecoveryController.text : null,
      notes: extraNotes ?? _notesController.text.trim(),
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Factory status updated to $_selectedStatus'),
        backgroundColor: _selectedStatus == AppConstants.statusEmergency ? AppColors.dangerText : AppColors.primary,
      ),
    );

    Navigator.pop(context);
  }

  void _handleSave() {
    if (_selectedStatus == AppConstants.statusEmergency) {
      _confirmEmergencyShutdown();
    } else {
      _executeStatusSave();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Factory Operational Status'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            if (_selectedStatus == AppConstants.statusEmergency) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.statusEmergencyBg,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: const [
                    Icon(LucideIcons.alertOctagon, color: Colors.white, size: 28),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'EMERGENCY SHUTDOWN ACTIVE — New batch assignments strictly prohibited across all logistics channels.',
                        style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Select Operational Status',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.neutralDark),
                  ),
                  const SizedBox(height: 12),

                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _statusOptions.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final item = _statusOptions[index];
                      final isSel = _selectedStatus == item['id'];

                      return InkWell(
                        onTap: () => setState(() => _selectedStatus = item['id'] as String),
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isSel ? (item['color'] as Color).withOpacity(0.1) : AppColors.bgSlate,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSel ? (item['color'] as Color) : AppColors.borderGray,
                              width: isSel ? 2 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(item['icon'] as IconData, color: item['color'] as Color, size: 24),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item['label'] as String,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w800,
                                        color: isSel ? (item['color'] as Color) : AppColors.neutralDark,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      item['sub'] as String,
                                      style: const TextStyle(fontSize: 12, color: AppColors.neutralGray),
                                    ),
                                  ],
                                ),
                              ),
                              if (isSel)
                                Icon(LucideIcons.checkCircle2, color: item['color'] as Color, size: 20),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 20),

                  if (_selectedStatus == AppConstants.statusMaintenance) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.dangerBg,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.dangerBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Maintenance Downtime Schedule',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.dangerText),
                          ),
                          const SizedBox(height: 12),
                          AppTextField(
                            label: 'Maintenance Start Time',
                            hint: 'e.g. Today 14:00',
                            controller: _maintStartController,
                            prefixIcon: LucideIcons.clock,
                          ),
                          const SizedBox(height: 12),
                          AppTextField(
                            label: 'Expected Recovery Time',
                            hint: 'e.g. Tomorrow 08:00',
                            controller: _expRecoveryController,
                            prefixIcon: LucideIcons.calendarCheck,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  AppTextField(
                    label: 'Status Change Operational Notes',
                    hint: 'Details regarding maintenance or capacity limits...',
                    controller: _notesController,
                    prefixIcon: LucideIcons.fileText,
                    maxLines: 2,
                  ),
                  const SizedBox(height: 24),

                  AppButton(
                    label: 'Save & Broadcast Factory Status',
                    icon: LucideIcons.save,
                    type: _selectedStatus == AppConstants.statusEmergency ? AppButtonType.danger : AppButtonType.primary,
                    onPressed: _handleSave,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
