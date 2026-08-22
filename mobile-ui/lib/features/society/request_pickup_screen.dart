import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../services/society_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_text_field.dart';

class RequestPickupScreen extends StatefulWidget {
  const RequestPickupScreen({super.key});

  @override
  State<RequestPickupScreen> createState() => _RequestPickupScreenState();
}

class _RequestPickupScreenState extends State<RequestPickupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _weightController = TextEditingController(text: '350');
  final _addressController = TextEditingController(text: 'Gate 2 Main Waste Collection Yard');
  final _notesController = TextEditingController();

  String _selectedCategory = AppConstants.streamWet;
  String _selectedTimeSlot = '09:00 AM - 11:00 AM';
  final String _selectedPriority = 'MEDIUM';

  final List<Map<String, dynamic>> _categories = [
    {'id': AppConstants.streamWet, 'label': 'Wet Organic', 'icon': Icons.compost, 'color': AppColors.streamWetText},
    {'id': AppConstants.streamDry, 'label': 'Dry Recyclables', 'icon': LucideIcons.package, 'color': AppColors.streamDryText},
    {'id': AppConstants.streamHazardous, 'label': 'Hazardous / E-Waste', 'icon': LucideIcons.alertTriangle, 'color': AppColors.streamHazardousText},
    {'id': AppConstants.streamSanitary, 'label': 'Sanitary', 'icon': LucideIcons.shield, 'color': AppColors.streamSanitaryText},
  ];

  @override
  void dispose() {
    _weightController.dispose();
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    if (!_formKey.currentState!.validate()) return;

    final weight = double.tryParse(_weightController.text) ?? 100.0;
    context.read<SocietyService>().requestPickup(
      streamCategory: _selectedCategory,
      weightKg: weight,
      requestedDate: 'Today',
      timeSlot: _selectedTimeSlot,
      address: _addressController.text.trim(),
      priority: _selectedPriority,
    );

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Waste pickup requested successfully! Driver assigned.'),
        backgroundColor: AppColors.primary,
      ),
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('New Pickup Request'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 80.0),
        child: AppCard(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Select Waste Stream Category',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
                ),
                const SizedBox(height: 10),

                // Category selector grid
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 2.3,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                  ),
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final isSel = _selectedCategory == cat['id'];

                    return InkWell(
                      onTap: () => setState(() => _selectedCategory = cat['id'] as String),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: isSel ? (cat['color'] as Color).withValues(alpha: 0.12) : AppColors.bgSlate,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSel ? (cat['color'] as Color) : AppColors.borderGray,
                            width: isSel ? 1.5 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(cat['icon'] as IconData, size: 18, color: cat['color'] as Color),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                cat['label'] as String,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isSel ? (cat['color'] as Color) : AppColors.neutralDark,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),

                AppTextField(
                  label: 'Estimated Weight (kg)',
                  hint: 'e.g. 350',
                  controller: _weightController,
                  keyboardType: TextInputType.number,
                  prefixIcon: LucideIcons.scale,
                  validator: (val) {
                    if (val == null || val.isEmpty) return 'Enter payload weight';
                    if (double.tryParse(val) == null) return 'Enter valid number';
                    return null;
                  },
                ),
                const SizedBox(height: 14),

                AppTextField(
                  label: 'Collection Yard / Location',
                  controller: _addressController,
                  prefixIcon: LucideIcons.mapPin,
                  validator: (val) => val == null || val.isEmpty ? 'Enter pickup location' : null,
                ),
                const SizedBox(height: 14),

                const Text(
                  'Preferred Pickup Window',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.neutralDark),
                ),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  initialValue: _selectedTimeSlot,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(LucideIcons.clock, size: 18),
                  ),
                  items: [
                    '09:00 AM - 11:00 AM',
                    '11:00 AM - 01:00 PM',
                    '02:00 PM - 04:00 PM',
                    '04:00 PM - 06:00 PM',
                  ].map((slot) => DropdownMenuItem(value: slot, child: Text(slot, style: const TextStyle(fontSize: 13)))).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedTimeSlot = val);
                  },
                ),
                const SizedBox(height: 14),

                AppTextField(
                  label: 'Additional Yard Instructions (Optional)',
                  hint: 'e.g. Ramp gate key with security guard',
                  controller: _notesController,
                  maxLines: 2,
                  prefixIcon: LucideIcons.fileText,
                ),
                const SizedBox(height: 18),

                AppButton(
                  label: 'Submit Waste Pickup Request',
                  icon: LucideIcons.send,
                  height: 44,
                  onPressed: _handleSubmit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
