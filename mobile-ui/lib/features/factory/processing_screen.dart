import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../services/factory_service.dart';
import '../../shared/models/models.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/status_badge.dart';

class ProcessingScreen extends StatelessWidget {
  const ProcessingScreen({super.key});

  void _showCompleteDialog(BuildContext context, BatchProcessingLogModel item) {
    final recoveredController = TextEditingController(text: (item.receivedWeightKg * 0.92).toStringAsFixed(0));
    final rejectController = TextEditingController(text: (item.receivedWeightKg * 0.08).toStringAsFixed(0));
    String? errorMsg;

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Row(
                children: const [
                  Icon(LucideIcons.checkCircle2, color: AppColors.primary, size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Complete Batch Processing',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Batch Code: ${item.batchCode}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                    Text('Received Intake: ${item.receivedWeightKg.toStringAsFixed(0)} kg', style: const TextStyle(color: AppColors.neutralGray, fontSize: 11)),
                    const Divider(height: 16),

                    if (errorMsg != null) ...[
                      Text(errorMsg!, style: const TextStyle(color: AppColors.dangerText, fontSize: 11, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                    ],

                    AppTextField(
                      label: 'Recovered Material Weight (kg)',
                      controller: recoveredController,
                      keyboardType: TextInputType.number,
                      prefixIcon: LucideIcons.recycle,
                    ),
                    const SizedBox(height: 10),
                    AppTextField(
                      label: 'Residue / Reject Weight (kg)',
                      controller: rejectController,
                      keyboardType: TextInputType.number,
                      prefixIcon: LucideIcons.trash2,
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Cancel', style: TextStyle(color: AppColors.neutralGray, fontSize: 13)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    minimumSize: const Size(110, 38),
                  ),
                  onPressed: () {
                    final rec = double.tryParse(recoveredController.text) ?? 0;
                    final rej = double.tryParse(rejectController.text) ?? 0;

                    if ((rec + rej) > item.receivedWeightKg * 1.05) {
                      setDialogState(() {
                        errorMsg = 'Recovered (${rec.toStringAsFixed(0)}kg) + Residue (${rej.toStringAsFixed(0)}kg) cannot exceed Received intake (${item.receivedWeightKg.toStringAsFixed(0)}kg)';
                      });
                      return;
                    }

                    context.read<FactoryService>().completeProcessing(item.id, rec, rej);
                    Navigator.pop(ctx);

                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Material balance recorded & batch completed successfully!'),
                        backgroundColor: AppColors.primary,
                      ),
                    );
                  },
                  child: const Text('Submit Balance', style: TextStyle(fontSize: 13)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final factoryService = context.watch<FactoryService>();
    final logs = factoryService.processingLogs;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Batch Processing Queue'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 80.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Intake Processing Controls',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
            ),
            const SizedBox(height: 2),
            const Text(
              'Manage sorting, composting & material recovery balance',
              style: TextStyle(fontSize: 11, color: AppColors.neutralGray),
            ),
            const SizedBox(height: 14),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: logs.length,
              itemBuilder: (context, index) {
                final item = logs[index];
                final isCompleted = item.processingStatus == 'COMPLETED';

                return AppCard(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          StatusBadge.streamCategory(item.streamCategory),
                          StatusBadge.factoryStatus(item.processingStatus),
                        ],
                      ),
                      const SizedBox(height: 10),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.batchCode, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.neutralDark)),
                                Text('Intake: ${item.receivedWeightKg.toStringAsFixed(0)} kg', style: const TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          if (isCompleted)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text('Recovered: ${item.processedWeightKg.toStringAsFixed(0)} kg', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary)),
                                Text('Residue: ${item.rejectWeightKg.toStringAsFixed(0)} kg', style: const TextStyle(fontSize: 11, color: AppColors.neutralGray)),
                              ],
                            ),
                        ],
                      ),
                      const Divider(height: 16),

                      if (!isCompleted)
                        Row(
                          children: [
                            if (item.processingStatus == 'PENDING')
                              Expanded(
                                child: AppButton(
                                  label: 'Start Sorting',
                                  icon: LucideIcons.play,
                                  height: 38,
                                  onPressed: () {
                                    factoryService.updateProcessingStatus(item.id, 'IN_PROCESSING');
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('Batch ${item.batchCode} moved to Processing status.'), backgroundColor: AppColors.primary),
                                    );
                                  },
                                ),
                              ),
                            if (item.processingStatus == 'IN_PROCESSING') ...[
                              Expanded(
                                child: AppButton(
                                  label: 'Record Recovery Balance',
                                  icon: LucideIcons.checkCircle2,
                                  height: 38,
                                  onPressed: () => _showCompleteDialog(context, item),
                                ),
                              ),
                            ],
                          ],
                        )
                      else
                        const Row(
                          children: [
                            Icon(LucideIcons.checkCircle, color: AppColors.successText, size: 14),
                            SizedBox(width: 6),
                            Text('Balance verified & closed.', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.successText)),
                          ],
                        ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
