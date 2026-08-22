import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../services/society_service.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/status_badge.dart';

class PickupHistoryScreen extends StatefulWidget {
  const PickupHistoryScreen({super.key});

  @override
  State<PickupHistoryScreen> createState() => _PickupHistoryScreenState();
}

class _PickupHistoryScreenState extends State<PickupHistoryScreen> {
  String _selectedFilter = 'ALL';

  @override
  Widget build(BuildContext context) {
    final societyService = context.watch<SocietyService>();
    final allPickups = societyService.pickups;

    final filteredPickups = allPickups.where((p) {
      if (_selectedFilter == 'COMPLETED') return p.status == AppConstants.pickupCompleted;
      if (_selectedFilter == 'ACTIVE') return p.status != AppConstants.pickupCompleted;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Pickup Request History'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 80.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Filter Pills Row with Horizontal Scroll Safety
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _FilterChip(
                    label: 'All Requests (${allPickups.length})',
                    isSelected: _selectedFilter == 'ALL',
                    onTap: () => setState(() => _selectedFilter = 'ALL'),
                  ),
                  const SizedBox(width: 8),
                  _FilterChip(
                    label: 'Active',
                    isSelected: _selectedFilter == 'ACTIVE',
                    onTap: () => setState(() => _selectedFilter = 'ACTIVE'),
                  ),
                  const SizedBox(width: 8),
                  _FilterChip(
                    label: 'Completed',
                    isSelected: _selectedFilter == 'COMPLETED',
                    onTap: () => setState(() => _selectedFilter = 'COMPLETED'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            if (filteredPickups.isEmpty)
              const AppCard(
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Text('No pickup requests match the selected filter.'),
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filteredPickups.length,
                itemBuilder: (context, index) {
                  final item = filteredPickups[index];
                  return AppCard(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            StatusBadge.streamCategory(item.streamCategory),
                            StatusBadge.pickupStatus(item.status),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${item.weightKg.toStringAsFixed(0)} kg Weight',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.neutralDark),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    item.address,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 12, color: AppColors.neutralGray),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  item.requestedDate,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
                                ),
                                Text(
                                  item.timeSlot,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 11, color: AppColors.neutralGray),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const Divider(height: 20),
                        Row(
                          children: [
                            const Icon(LucideIcons.truck, size: 16, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Driver: ${item.assignedDriverName ?? "Pending"}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Token: ${item.qrCodeToken}',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.neutralGray),
                            ),
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

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.borderGray),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : AppColors.neutralDark,
          ),
        ),
      ),
    );
  }
}
