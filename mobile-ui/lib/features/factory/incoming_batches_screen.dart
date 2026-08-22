import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../services/factory_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/status_badge.dart';

class IncomingBatchesScreen extends StatelessWidget {
  const IncomingBatchesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final factoryService = context.watch<FactoryService>();
    final incoming = factoryService.incomingBatches;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Incoming Batches Queue'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 80.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'En Route Trucks (${incoming.length})',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.neutralDark),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.warningBg,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text('Live Telemetry', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.warningText)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (incoming.isEmpty)
              const AppCard(
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Text('No incoming trucks currently en route.'),
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: incoming.length,
                itemBuilder: (context, index) {
                  final item = incoming[index];
                  return AppCard(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            StatusBadge.streamCategory(item.streamCategory),
                            Text('ETA: ${item.etaMinutes}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.primary)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item.batchCode, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
                                  Text('Origin: ${item.originSociety}', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                                  Text('Driver: ${item.driverName} (${item.vehicleNo})', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: AppColors.neutralGray)),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text('${item.totalWeightKg.toStringAsFixed(0)} kg', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.neutralDark)),
                          ],
                        ),
                        const SizedBox(height: 14),
                        AppButton(
                          label: 'Scan QR & Confirm Weighbridge Intake',
                          icon: LucideIcons.qrCode,
                          height: 42,
                          onPressed: () {
                            final ok = factoryService.receiveBatch(item.qrCodeToken);
                            if (ok) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Shipment received into processing queue!'), backgroundColor: AppColors.primary),
                              );
                            }
                          },
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
