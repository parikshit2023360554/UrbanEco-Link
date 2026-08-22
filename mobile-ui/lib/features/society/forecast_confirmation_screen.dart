import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../services/society_service.dart';
import '../../shared/models/models.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/grade_badge.dart';
import '../../shared/widgets/status_badge.dart';

class ForecastConfirmationScreen extends StatefulWidget {
  final WasteForecastModel forecast;

  const ForecastConfirmationScreen({super.key, required this.forecast});

  @override
  State<ForecastConfirmationScreen> createState() => _ForecastConfirmationScreenState();
}

class _ForecastConfirmationScreenState extends State<ForecastConfirmationScreen> {
  late TextEditingController _weightController;
  late String _selectedTimeSlot;

  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    _weightController = TextEditingController(text: widget.forecast.predictedWeightKg.toStringAsFixed(0));
    _selectedTimeSlot = widget.forecast.predictedTimeSlot;
  }

  @override
  void dispose() {
    _weightController.dispose();
    super.dispose();
  }

  void _handleConfirm() {
    final weight = double.tryParse(_weightController.text) ?? widget.forecast.predictedWeightKg;
    final societyService = context.read<SocietyService>();

    societyService.confirmForecast(
      widget.forecast.id,
      editedWeight: weight != widget.forecast.predictedWeightKg ? weight : null,
      editedTime: _selectedTimeSlot != widget.forecast.predictedTimeSlot ? _selectedTimeSlot : null,
    );

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Forecast confirmed! Real pickup request dispatched to logistics network.'),
        backgroundColor: AppColors.primary,
      ),
    );

    Navigator.pop(context);
  }

  void _handleNoPickup() {
    context.read<SocietyService>().cancelForecast(widget.forecast.id);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Forecast marked as No Pickup.'),
        backgroundColor: AppColors.neutralDark,
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Confirm AI Waste Forecast'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 14.0, bottom: 80.0),
        child: Column(
          children: [
            // Banner Alert
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.infoBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.infoBorder),
              ),
              child: Row(
                children: const [
                  Icon(LucideIcons.info, color: AppColors.infoText, size: 16),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'AI predictions do NOT automatically create pickup batches. Please confirm or edit your estimate before dispatch.',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: AppColors.infoText),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Forecast Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const GradeBadge(grade: 'A+', size: 32),
                          const SizedBox(width: 8),
                          StatusBadge.streamCategory(widget.forecast.streamCategory),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(LucideIcons.sparkles, size: 11, color: AppColors.primary),
                            const SizedBox(width: 3),
                            Text(
                              '${widget.forecast.confidencePercentage}% Confidence',
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primaryDark,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Forecast Details Grid
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.bgSlate,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Column(
                      children: [
                        _DetailRow(
                          label: 'Predicted Waste Stream',
                          value: '${widget.forecast.streamCategory} Organic Stream',
                          icon: LucideIcons.layers,
                        ),
                        const Divider(height: 14),
                        _DetailRow(
                          label: 'Predicted Payload Weight',
                          value: '${widget.forecast.predictedWeightKg.toStringAsFixed(0)} kg',
                          icon: LucideIcons.scale,
                        ),
                        const Divider(height: 14),
                        _DetailRow(
                          label: 'Predicted Date',
                          value: widget.forecast.predictedDate,
                          icon: LucideIcons.calendar,
                        ),
                        const Divider(height: 14),
                        _DetailRow(
                          label: 'Predicted Time Window',
                          value: _selectedTimeSlot,
                          icon: LucideIcons.clock,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Edit Controls section
                  if (_isEditing) ...[
                    AppTextField(
                      label: 'Edit Estimated Payload (kg)',
                      controller: _weightController,
                      keyboardType: TextInputType.number,
                      prefixIcon: LucideIcons.scale,
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Select Preferred Time Window',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 5),
                    Wrap(
                      spacing: 6,
                      children: [
                        '09:00 - 11:00',
                        '11:00 - 13:00',
                        '14:00 - 16:00',
                        '16:00 - 18:00',
                      ].map((slot) {
                        final isSel = _selectedTimeSlot == slot;
                        return ChoiceChip(
                          label: Text(slot),
                          selected: isSel,
                          onSelected: (val) {
                            if (val) setState(() => _selectedTimeSlot = slot);
                          },
                          selectedColor: AppColors.primaryLight,
                          labelStyle: TextStyle(
                            color: isSel ? AppColors.primaryDark : AppColors.neutralDark,
                            fontWeight: isSel ? FontWeight.w600 : FontWeight.w400,
                            fontSize: 10,
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 12),
                  ],

                  // Action Buttons Stack
                  AppButton(
                    label: 'Confirm Pickup & Dispatch',
                    icon: LucideIcons.checkCircle2,
                    height: 40,
                    onPressed: _handleConfirm,
                  ),
                  const SizedBox(height: 8),

                  Row(
                    children: [
                      Expanded(
                        child: AppButton(
                          label: _isEditing ? 'Close Editing' : 'Edit Quantities',
                          icon: LucideIcons.edit3,
                          type: AppButtonType.outline,
                          height: 36,
                          onPressed: () => setState(() => _isEditing = !_isEditing),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: AppButton(
                          label: 'No Pickup Today',
                          icon: LucideIcons.xCircle,
                          type: AppButtonType.danger,
                          height: 36,
                          onPressed: _handleNoPickup,
                        ),
                      ),
                    ],
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

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _DetailRow({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppColors.primary),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 10, color: AppColors.neutralGray)),
              const SizedBox(height: 1),
              Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.neutralDark)),
            ],
          ),
        ),
      ],
    );
  }
}
