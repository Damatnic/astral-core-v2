/**
 * Cultural Mental Health Service
 * 
 * Provides culturally-sensitive mental health content and approaches
 * tailored to each supported locale
 * 
 * @license Apache-2.0
 */

import { getCulturalContext } from '../i18n';

export interface CulturalMentalHealthContent {
  locale: string;
  culturalContext: {
    stigmaLevel: 'low' | 'medium' | 'high';
    familyInvolvement: 'low' | 'medium' | 'high';
    communitySupport: 'low' | 'medium' | 'high';
    religiousContext: string;
    preferredApproach: string;
  };
  copingStrategies: CopingStrategy[];
  crisisApproaches: CrisisApproach[];
  culturalConsiderations: string[];
  supportResources: SupportResource[];
  communicationGuidelines: CommunicationGuideline[];
}

interface CopingStrategy {
  id: string;
  name: string;
  description: string;
  culturallyAppropriate: boolean;
  category: 'spiritual' | 'family' | 'community' | 'individual' | 'professional';
  effectiveness: number; // 1-5 scale
  steps?: string[];
}

interface CrisisApproach {
  id: string;
  name: string;
  description: string;
  urgencyLevel: 'immediate' | 'urgent' | 'moderate';
  culturalFactors: string[];
  steps: string[];
  whenToUse: string;
}

interface SupportResource {
  id: string;
  name: string;
  type: 'family' | 'community' | 'religious' | 'professional' | 'peer';
  description: string;
  availability: string;
  culturallyPreferred: boolean;
}

interface CommunicationGuideline {
  context: string;
  recommendation: string;
  culturalNuance: string;
  examples: string[];
}

class CulturalMentalHealthService {
  private static instance: CulturalMentalHealthService;
  private contentCache: Map<string, CulturalMentalHealthContent> = new Map();

  private constructor() {
    this.initializeContent();
  }

  static getInstance(): CulturalMentalHealthService {
    if (!CulturalMentalHealthService.instance) {
      CulturalMentalHealthService.instance = new CulturalMentalHealthService();
    }
    return CulturalMentalHealthService.instance;
  }

  /**
   * Initialize cultural content for all supported locales
   */
  private initializeContent(): void {
    // English (Western approach)
    this.contentCache.set('en', {
      locale: 'en',
      culturalContext: {
        stigmaLevel: 'medium',
        familyInvolvement: 'medium',
        communitySupport: 'medium',
        religiousContext: 'mixed',
        preferredApproach: 'professional'
      },
      copingStrategies: [
        {
          id: 'en-mindfulness',
          name: 'Mindfulness Meditation',
          description: 'Focus on present moment awareness to reduce anxiety and stress',
          culturallyAppropriate: true,
          category: 'individual',
          effectiveness: 4,
          steps: [
            'Find a quiet, comfortable space',
            'Close your eyes or soften your gaze',
            'Focus on your breath',
            'Notice thoughts without judgment',
            'Gently return focus to breathing',
            'Continue for 5-10 minutes'
          ]
        },
        {
          id: 'en-cbt',
          name: 'Cognitive Restructuring',
          description: 'Challenge and reframe negative thought patterns',
          culturallyAppropriate: true,
          category: 'professional',
          effectiveness: 5,
          steps: [
            'Identify the negative thought',
            'Examine evidence for and against',
            'Consider alternative perspectives',
            'Create a balanced thought',
            'Test the new perspective'
          ]
        },
        {
          id: 'en-exercise',
          name: 'Physical Exercise',
          description: 'Regular physical activity to improve mood and reduce stress',
          culturallyAppropriate: true,
          category: 'individual',
          effectiveness: 4,
          steps: [
            'Choose an activity you enjoy',
            'Start with 15-20 minutes',
            'Gradually increase duration',
            'Aim for 3-5 times per week',
            'Track your mood improvements'
          ]
        }
      ],
      crisisApproaches: [
        {
          id: 'en-crisis-professional',
          name: 'Professional Crisis Intervention',
          description: 'Immediate professional mental health support',
          urgencyLevel: 'immediate',
          culturalFactors: ['Individual autonomy valued', 'Privacy important', 'Professional expertise trusted'],
          steps: [
            'Call 988 Suicide & Crisis Lifeline',
            'Or text "HELLO" to 741741',
            'Go to nearest emergency room if in immediate danger',
            'Contact your therapist or psychiatrist',
            'Follow safety plan if you have one'
          ],
          whenToUse: 'When experiencing suicidal thoughts, self-harm urges, or severe mental health crisis'
        }
      ],
      culturalConsiderations: [
        'Individual therapy is widely accepted',
        'Medication may be offered as first-line treatment',
        'Privacy and confidentiality are paramount',
        'Self-advocacy is encouraged in treatment',
        'Evidence-based approaches are preferred'
      ],
      supportResources: [
        {
          id: 'en-therapist',
          name: 'Licensed Therapist',
          type: 'professional',
          description: 'Professional mental health counseling',
          availability: 'By appointment, covered by many insurance plans',
          culturallyPreferred: true
        },
        {
          id: 'en-support-group',
          name: 'Support Groups',
          type: 'peer',
          description: 'Peer-led groups for shared experiences',
          availability: 'Weekly meetings, online and in-person options',
          culturallyPreferred: true
        }
      ],
      communicationGuidelines: [
        {
          context: 'Discussing mental health',
          recommendation: 'Use direct, clear language about symptoms and feelings',
          culturalNuance: 'Personal responsibility and self-improvement are valued',
          examples: [
            '"I\'m struggling with depression"',
            '"I need professional help"',
            '"My anxiety is affecting my work"'
          ]
        }
      ]
    });

    // Spanish (Latino/Hispanic approach)
    this.contentCache.set('es', {
      locale: 'es',
      culturalContext: {
        stigmaLevel: 'high',
        familyInvolvement: 'high',
        communitySupport: 'high',
        religiousContext: 'christian',
        preferredApproach: 'family'
      },
      copingStrategies: [
        {
          id: 'es-family-support',
          name: 'Apoyo Familiar',
          description: 'Buscar consuelo y consejo en la familia cercana',
          culturallyAppropriate: true,
          category: 'family',
          effectiveness: 5,
          steps: [
            'Hablar con un familiar de confianza',
            'Compartir sus preocupaciones abiertamente',
            'Pedir consejo y orientación',
            'Participar en actividades familiares',
            'Mantener conexiones familiares regulares'
          ]
        },
        {
          id: 'es-prayer',
          name: 'Oración y Fe',
          description: 'Encontrar fortaleza a través de la práctica espiritual',
          culturallyAppropriate: true,
          category: 'spiritual',
          effectiveness: 5,
          steps: [
            'Dedicar tiempo diario a la oración',
            'Leer textos sagrados reconfortantes',
            'Asistir a servicios religiosos',
            'Hablar con un líder espiritual',
            'Participar en grupos de oración'
          ]
        },
        {
          id: 'es-sobremesa',
          name: 'Sobremesa Terapéutica',
          description: 'Conversaciones profundas después de comidas familiares',
          culturallyAppropriate: true,
          category: 'family',
          effectiveness: 4,
          steps: [
            'Organizar comidas familiares regulares',
            'Permanecer en la mesa después de comer',
            'Compartir experiencias y sentimientos',
            'Escuchar sin juzgar',
            'Ofrecer apoyo mutuo'
          ]
        }
      ],
      crisisApproaches: [
        {
          id: 'es-crisis-family',
          name: 'Intervención Familiar de Crisis',
          description: 'Movilizar a la familia para apoyo inmediato',
          urgencyLevel: 'immediate',
          culturalFactors: [
            'La familia es la primera línea de apoyo',
            'La vergüenza puede retrasar la búsqueda de ayuda',
            'Los mayores son respetados consejeros'
          ],
          steps: [
            'Contactar al familiar más cercano de confianza',
            'Reunir a la familia inmediata',
            'Buscar consejo del miembro mayor de la familia',
            'Considerar hablar con un sacerdote o pastor',
            'Si es necesario, buscar ayuda profesional con apoyo familiar'
          ],
          whenToUse: 'Cuando se siente abrumado, con pensamientos negativos persistentes o en crisis emocional'
        }
      ],
      culturalConsiderations: [
        'El "qué dirán" puede influir en buscar ayuda',
        'La familia extendida juega un rol importante',
        'La fe y religión son fuentes de fortaleza',
        'Los problemas personales son asuntos familiares',
        'Resistencia a medicación psiquiátrica es común'
      ],
      supportResources: [
        {
          id: 'es-priest',
          name: 'Consejero Espiritual',
          type: 'religious',
          description: 'Orientación espiritual y emocional',
          availability: 'Disponible en la iglesia local',
          culturallyPreferred: true
        },
        {
          id: 'es-comadre',
          name: 'Comadres/Compadres',
          type: 'community',
          description: 'Red de apoyo comunitario tradicional',
          availability: 'Red social establecida',
          culturallyPreferred: true
        }
      ],
      communicationGuidelines: [
        {
          context: 'Hablar de salud mental',
          recommendation: 'Usar términos indirectos o somáticos',
          culturalNuance: 'Evitar términos que impliquen "locura" o debilidad',
          examples: [
            '"Me siento nervioso/a"',
            '"Tengo los nervios alterados"',
            '"Necesito desahogarme"'
          ]
        }
      ]
    });

    // Portuguese (Brazilian approach)
    this.contentCache.set('pt-BR', {
      locale: 'pt-BR',
      culturalContext: {
        stigmaLevel: 'high',
        familyInvolvement: 'high',
        communitySupport: 'high',
        religiousContext: 'christian',
        preferredApproach: 'community'
      },
      copingStrategies: [
        {
          id: 'pt-social',
          name: 'Roda de Conversa',
          description: 'Círculos de conversação com amigos próximos',
          culturallyAppropriate: true,
          category: 'community',
          effectiveness: 4,
          steps: [
            'Reunir amigos de confiança',
            'Criar ambiente acolhedor',
            'Compartilhar experiências',
            'Oferecer apoio mútuo',
            'Manter encontros regulares'
          ]
        },
        {
          id: 'pt-music',
          name: 'Musicoterapia Brasileira',
          description: 'Usar música brasileira para expressar e processar emoções',
          culturallyAppropriate: true,
          category: 'individual',
          effectiveness: 4,
          steps: [
            'Escolher músicas que ressoem com seus sentimentos',
            'Cantar ou tocar instrumentos',
            'Participar de rodas de samba ou música',
            'Escrever letras sobre suas experiências',
            'Compartilhar música com outros'
          ]
        }
      ],
      crisisApproaches: [
        {
          id: 'pt-crisis-community',
          name: 'Rede de Apoio Comunitária',
          description: 'Mobilizar a comunidade para suporte',
          urgencyLevel: 'urgent',
          culturalFactors: [
            'Forte senso de comunidade',
            'Jeitinho brasileiro para resolver problemas',
            'Preferência por soluções informais'
          ],
          steps: [
            'Contatar amigo ou vizinho de confiança',
            'Buscar apoio na comunidade religiosa',
            'Procurar o CAPS mais próximo',
            'Ligar para o CVV (188)',
            'Envolver família se apropriado'
          ],
          whenToUse: 'Quando precisar de apoio emocional imediato ou estiver em crise'
        }
      ],
      culturalConsiderations: [
        'O "jeitinho" pode influenciar acesso a serviços',
        'Festas e socialização são formas de terapia',
        'Espiritualidade mista é comum',
        'CAPS são preferidos a hospitais psiquiátricos',
        'Terapias alternativas são populares'
      ],
      supportResources: [
        {
          id: 'pt-caps',
          name: 'CAPS - Centro de Atenção Psicossocial',
          type: 'professional',
          description: 'Serviço público de saúde mental',
          availability: 'Gratuito pelo SUS',
          culturallyPreferred: true
        }
      ],
      communicationGuidelines: [
        {
          context: 'Discutir saúde mental',
          recommendation: 'Usar expressões coloquiais e metáforas',
          culturalNuance: 'Evitar parecer "fresco" ou dramático',
          examples: [
            '"Tô mal das ideias"',
            '"Preciso botar pra fora"',
            '"Tá difícil segurar a barra"'
          ]
        }
      ]
    });

    // Arabic (Middle Eastern approach)
    this.contentCache.set('ar', {
      locale: 'ar',
      culturalContext: {
        stigmaLevel: 'high',
        familyInvolvement: 'high',
        communitySupport: 'high',
        religiousContext: 'islamic',
        preferredApproach: 'family'
      },
      copingStrategies: [
        {
          id: 'ar-prayer',
          name: 'الصلاة والذكر',
          description: 'الصلاة اليومية والذكر للسلام الداخلي',
          culturallyAppropriate: true,
          category: 'spiritual',
          effectiveness: 5,
          steps: [
            'المحافظة على الصلوات الخمس',
            'قراءة القرآن يومياً',
            'الذكر والاستغفار',
            'صلاة الاستخارة عند الحاجة',
            'الدعاء في الثلث الأخير من الليل'
          ]
        },
        {
          id: 'ar-family-council',
          name: 'مجلس العائلة',
          description: 'استشارة كبار العائلة للحصول على التوجيه',
          culturallyAppropriate: true,
          category: 'family',
          effectiveness: 5,
          steps: [
            'التحدث مع الوالدين أو كبار العائلة',
            'طلب النصيحة بأدب واحترام',
            'الاستماع للحكمة والخبرة',
            'احترام التوجيه العائلي',
            'الحفاظ على خصوصية العائلة'
          ]
        },
        {
          id: 'ar-ruqyah',
          name: 'الرقية الشرعية',
          description: 'العلاج بالقرآن والأدعية النبوية',
          culturallyAppropriate: true,
          category: 'spiritual',
          effectiveness: 5,
          steps: [
            'قراءة سورة الفاتحة',
            'قراءة آية الكرسي',
            'قراءة المعوذات',
            'الأدعية النبوية للشفاء',
            'الاستماع للرقية الشرعية'
          ]
        }
      ],
      crisisApproaches: [
        {
          id: 'ar-crisis-family',
          name: 'التدخل العائلي',
          description: 'حشد العائلة للدعم الفوري',
          urgencyLevel: 'immediate',
          culturalFactors: [
            'شرف العائلة مهم جداً',
            'الخصوصية داخل العائلة فقط',
            'الشيوخ والعلماء مصادر موثوقة'
          ],
          steps: [
            'التحدث مع أحد الوالدين أو الأخ الأكبر',
            'طلب المشورة من شيخ موثوق',
            'اللجوء للرقية الشرعية',
            'زيارة طبيب إذا نصحت العائلة',
            'الحفاظ على السرية العائلية'
          ],
          whenToUse: 'عند الشعور بالضيق الشديد أو الأفكار السلبية المستمرة'
        }
      ],
      culturalConsiderations: [
        'الصحة النفسية قد تُفسر روحانياً',
        'العار الاجتماعي يمنع طلب المساعدة',
        'الفصل بين الجنسين في العلاج مهم',
        'الحلول الدينية مفضلة على الطبية',
        'كبار السن لهم احترام وسلطة'
      ],
      supportResources: [
        {
          id: 'ar-imam',
          name: 'الإمام أو الشيخ',
          type: 'religious',
          description: 'الإرشاد الديني والروحي',
          availability: 'متاح في المسجد المحلي',
          culturallyPreferred: true
        },
        {
          id: 'ar-family-elder',
          name: 'كبير العائلة',
          type: 'family',
          description: 'الحكمة والتوجيه من كبار السن',
          availability: 'داخل العائلة',
          culturallyPreferred: true
        }
      ],
      communicationGuidelines: [
        {
          context: 'التحدث عن الصحة النفسية',
          recommendation: 'استخدام المصطلحات الدينية والروحية',
          culturalNuance: 'تجنب المصطلحات التي تشير للجنون',
          examples: [
            '"أشعر بضيق في صدري"',
            '"أحتاج للدعاء"',
            '"قلبي مقبوض"'
          ]
        }
      ]
    });

    // Chinese (East Asian approach)
    this.contentCache.set('zh', {
      locale: 'zh',
      culturalContext: {
        stigmaLevel: 'high',
        familyInvolvement: 'high',
        communitySupport: 'medium',
        religiousContext: 'mixed',
        preferredApproach: 'family'
      },
      copingStrategies: [
        {
          id: 'zh-qigong',
          name: '气功练习',
          description: '通过气功调节身心平衡',
          culturallyAppropriate: true,
          category: 'individual',
          effectiveness: 4,
          steps: [
            '找一个安静的地方',
            '站立或坐姿舒适',
            '调整呼吸节奏',
            '缓慢移动身体',
            '意念集中丹田',
            '每天练习20-30分钟'
          ]
        },
        {
          id: 'zh-tcm',
          name: '中医调理',
          description: '通过中医方法调理情志',
          culturallyAppropriate: true,
          category: 'professional',
          effectiveness: 4,
          steps: [
            '寻找信誉良好的中医师',
            '详细描述身心症状',
            '按医嘱服用中药',
            '配合针灸或推拿',
            '调整饮食和作息'
          ]
        },
        {
          id: 'zh-face',
          name: '保持面子策略',
          description: '在维护尊严的同时寻求帮助',
          culturallyAppropriate: true,
          category: 'family',
          effectiveness: 3,
          steps: [
            '私下与信任的家人交谈',
            '强调身体症状而非情绪',
            '寻求"调理"而非"治疗"',
            '保持家庭内部处理',
            '逐步接受专业帮助'
          ]
        }
      ],
      crisisApproaches: [
        {
          id: 'zh-crisis-discrete',
          name: '谨慎危机干预',
          description: '在保护面子的前提下获得帮助',
          urgencyLevel: 'urgent',
          culturalFactors: [
            '面子极其重要',
            '家丑不可外扬',
            '集体利益高于个人'
          ],
          steps: [
            '先与最亲近的家人商议',
            '寻求中医"调理"',
            '如需要，悄悄咨询心理医生',
            '使用在线匿名咨询',
            '必要时家人陪同就医'
          ],
          whenToUse: '当感到极度压力、失眠严重或有自我伤害念头时'
        }
      ],
      culturalConsiderations: [
        '心理问题常被视为意志薄弱',
        '倾向于躯体化表达',
        '孝道可能增加压力',
        '学业/事业成功压力大',
        '集体和谐重于个人需求'
      ],
      supportResources: [
        {
          id: 'zh-tcm-doctor',
          name: '中医师',
          type: 'professional',
          description: '通过中医方法调理身心',
          availability: '预约就诊',
          culturallyPreferred: true
        },
        {
          id: 'zh-online-anon',
          name: '在线匿名咨询',
          type: 'professional',
          description: '保护隐私的专业咨询',
          availability: '24小时在线',
          culturallyPreferred: true
        }
      ],
      communicationGuidelines: [
        {
          context: '讨论心理健康',
          recommendation: '使用身体症状描述情绪问题',
          culturalNuance: '避免直接提及精神疾病',
          examples: [
            '"最近睡不好觉"',
            '"心里堵得慌"',
            '"需要调理一下身体"'
          ]
        }
      ]
    });

    // Vietnamese approach
    this.contentCache.set('vi', {
      locale: 'vi',
      culturalContext: {
        stigmaLevel: 'high',
        familyInvolvement: 'high',
        communitySupport: 'high',
        religiousContext: 'buddhist',
        preferredApproach: 'community'
      },
      copingStrategies: [
        {
          id: 'vi-meditation',
          name: 'Thiền Phật Giáo',
          description: 'Thực hành thiền định theo truyền thống Phật giáo',
          culturallyAppropriate: true,
          category: 'spiritual',
          effectiveness: 5,
          steps: [
            'Tìm nơi yên tĩnh trong chùa hoặc nhà',
            'Ngồi trong tư thế thoải mái',
            'Tập trung vào hơi thở',
            'Niệm Phật hoặc tụng kinh',
            'Thực hành từ bi với bản thân',
            'Duy trì 15-30 phút mỗi ngày'
          ]
        },
        {
          id: 'vi-ancestor',
          name: 'Cầu Nguyện Tổ Tiên',
          description: 'Tìm sức mạnh từ sự kết nối với tổ tiên',
          culturallyAppropriate: true,
          category: 'spiritual',
          effectiveness: 4,
          steps: [
            'Thắp hương tại bàn thờ tổ tiên',
            'Báo cáo khó khăn với tổ tiên',
            'Cầu xin sự phù hộ và hướng dẫn',
            'Hứa nguyện và giữ lời hứa',
            'Duy trì nghi lễ thường xuyên'
          ]
        }
      ],
      crisisApproaches: [
        {
          id: 'vi-crisis-community',
          name: 'Hỗ Trợ Cộng Đồng',
          description: 'Huy động láng giềng và cộng đồng',
          urgencyLevel: 'urgent',
          culturalFactors: [
            'Tình làng nghĩa xóm quan trọng',
            'Thể diện gia đình cần được bảo vệ',
            'Phật giáo ảnh hưởng mạnh'
          ],
          steps: [
            'Tâm sự với người láng giềng thân thiết',
            'Nhờ sư thầy tại chùa tư vấn',
            'Tham gia sinh hoạt cộng đồng',
            'Tìm bác sĩ Đông y hoặc châm cứu',
            'Cân nhắc đi bệnh viện nếu cần'
          ],
          whenToUse: 'Khi cảm thấy tuyệt vọng hoặc không thể tự xử lý'
        }
      ],
      culturalConsiderations: [
        'Karma và nghiệp báo ảnh hưởng nhận thức',
        'Gia đình mở rộng có vai trò lớn',
        'Thầy bói và tâm linh được tin tưởng',
        'Thuốc Nam được ưa chuộng',
        'Tránh mất mặt là ưu tiên'
      ],
      supportResources: [
        {
          id: 'vi-monk',
          name: 'Sư Thầy/Ni Cô',
          type: 'religious',
          description: 'Tư vấn tâm linh và hướng dẫn thiền',
          availability: 'Tại chùa địa phương',
          culturallyPreferred: true
        }
      ],
      communicationGuidelines: [
        {
          context: 'Nói về sức khỏe tâm thần',
          recommendation: 'Dùng ngôn ngữ gián tiếp và ẩn dụ',
          culturalNuance: 'Tránh nhãn mác bệnh tâm thần',
          examples: [
            '"Tâm không an"',
            '"Người không khỏe"',
            '"Cần tĩnh tâm"'
          ]
        }
      ]
    });

    // Tagalog/Filipino approach
    this.contentCache.set('tl', {
      locale: 'tl',
      culturalContext: {
        stigmaLevel: 'high',
        familyInvolvement: 'high',
        communitySupport: 'high',
        religiousContext: 'christian',
        preferredApproach: 'family'
      },
      copingStrategies: [
        {
          id: 'tl-bayanihan',
          name: 'Bayanihan Spirit',
          description: 'Pagkakaisa ng komunidad para sa suporta',
          culturallyAppropriate: true,
          category: 'community',
          effectiveness: 5,
          steps: [
            'Makipag-ugnayan sa mga kaibigan',
            'Sumali sa mga aktibidad ng barangay',
            'Tumulong sa iba para makaramdam ng layunin',
            'Magbahagi ng mga karanasan',
            'Panatilihin ang pakikipagkapwa'
          ]
        },
        {
          id: 'tl-prayer',
          name: 'Novena at Dasal',
          description: 'Paghahanap ng lakas sa pananampalataya',
          culturallyAppropriate: true,
          category: 'spiritual',
          effectiveness: 5,
          steps: [
            'Mag-novena sa simbahan',
            'Manalangin kasama ang pamilya',
            'Humingi ng bendisyon sa pari',
            'Magbasa ng Bibliya',
            'Sumali sa prayer group'
          ]
        },
        {
          id: 'tl-ventilation',
          name: 'Pakikipagkuwentuhan',
          description: 'Pagbabahagi ng damdamin sa mga kaibigan',
          culturallyAppropriate: true,
          category: 'community',
          effectiveness: 4,
          steps: [
            'Maghanap ng kumpare/kumare',
            'Mag-kwentuhan habang kumakain',
            'Makinig at magbigay ng payo',
            'Panatilihin ang tiwala',
            'Regular na pagkikita-kita'
          ]
        }
      ],
      crisisApproaches: [
        {
          id: 'tl-crisis-family',
          name: 'Pagtitipon ng Pamilya',
          description: 'Pagsasama ng pamilya para sa suporta',
          urgencyLevel: 'immediate',
          culturalFactors: [
            'Kapakanan ng pamilya ay mahalaga',
            'Hiya ay malaking hadlang',
            'Utang na loob sa pamilya'
          ],
          steps: [
            'Kausapin ang pinagkakatiwalaang kamag-anak',
            'Magpatawag ng family meeting',
            'Humingi ng payo sa nakatatanda',
            'Kumunsulta sa pari kung kailangan',
            'Magpatingin sa doktor kung payagan'
          ],
          whenToUse: 'Kapag hindi na kaya ng sarili at kailangan ng tulong'
        }
      ],
      culturalConsiderations: [
        'Hiya ay humahadlang sa paghingi ng tulong',
        'Bahala na attitude ay maaaring makasama o makabuti',
        'Extended family ay bahagi ng support system',
        'Ginhawa at pahinga ay cultural values',
        'Pakikipagkapwa-tao ay therapeutic'
      ],
      supportResources: [
        {
          id: 'tl-priest',
          name: 'Pari o Pastor',
          type: 'religious',
          description: 'Espirituwal na gabay at counseling',
          availability: 'Sa lokal na simbahan',
          culturallyPreferred: true
        },
        {
          id: 'tl-albularyo',
          name: 'Albularyo/Manghihilot',
          type: 'community',
          description: 'Tradisyonal na healing',
          availability: 'Sa komunidad',
          culturallyPreferred: true
        }
      ],
      communicationGuidelines: [
        {
          context: 'Pag-usap tungkol sa mental health',
          recommendation: 'Gamitin ang mga salitang pamilyar at hindi medical',
          culturalNuance: 'Iwasan ang salitang "baliw" o "sira-ulo"',
          examples: [
            '"Hindi ako okay"',
            '"Mabigat ang loob ko"',
            '"Kailangan ko ng kausap"'
          ]
        }
      ]
    });
  }

  /**
   * Get cultural mental health content for a specific locale
   */
  getCulturalContent(locale: string): CulturalMentalHealthContent | undefined {
    const baseLocale = locale.split('-')[0];
    return this.contentCache.get(locale) || this.contentCache.get(baseLocale);
  }

  /**
   * Get culturally appropriate coping strategies
   */
  getCopingStrategies(locale: string, category?: string): CopingStrategy[] {
    const content = this.getCulturalContent(locale);
    if (!content) return [];

    if (category) {
      return content.copingStrategies.filter(s => s.category === category);
    }
    return content.copingStrategies;
  }

  /**
   * Get crisis approaches for a locale
   */
  getCrisisApproaches(locale: string, urgencyLevel?: string): CrisisApproach[] {
    const content = this.getCulturalContent(locale);
    if (!content) return [];

    if (urgencyLevel) {
      return content.crisisApproaches.filter(a => a.urgencyLevel === urgencyLevel);
    }
    return content.crisisApproaches;
  }

  /**
   * Get support resources
   */
  getSupportResources(locale: string, type?: string): SupportResource[] {
    const content = this.getCulturalContent(locale);
    if (!content) return [];

    if (type) {
      return content.supportResources.filter(r => r.type === type);
    }
    return content.supportResources;
  }

  /**
   * Get communication guidelines
   */
  getCommunicationGuidelines(locale: string): CommunicationGuideline[] {
    const content = this.getCulturalContent(locale);
    return content?.communicationGuidelines || [];
  }

  /**
   * Get cultural considerations
   */
  getCulturalConsiderations(locale: string): string[] {
    const content = this.getCulturalContent(locale);
    return content?.culturalConsiderations || [];
  }

  /**
   * Check if a coping strategy is culturally appropriate
   */
  isCulturallyAppropriate(locale: string, strategyId: string): boolean {
    const content = this.getCulturalContent(locale);
    if (!content) return false;

    const strategy = content.copingStrategies.find(s => s.id === strategyId);
    return strategy?.culturallyAppropriate || false;
  }

  /**
   * Get recommended approach based on cultural context
   */
  getRecommendedApproach(locale: string, situation: 'crisis' | 'ongoing' | 'preventive'): string {
    const content = this.getCulturalContent(locale);
    if (!content) return 'professional';

    const context = getCulturalContext(locale);
    
    switch (situation) {
      case 'crisis':
        if (context.mentalHealthStigma === 'high') {
          return context.crisisEscalationPreference || 'family';
        }
        return 'professional';
        
      case 'ongoing':
        if (context.familyInvolvement === 'high') {
          return 'family';
        }
        if (context.communitySupport === 'high') {
          return 'community';
        }
        return 'professional';
        
      case 'preventive':
        return content.culturalContext.preferredApproach;
        
      default:
        return 'professional';
    }
  }

  /**
   * Adapt mental health message for cultural context
   */
  adaptMessage(message: string, locale: string): string {
    const content = this.getCulturalContent(locale);
    if (!content) return message;

    // This would involve complex NLP and cultural adaptation
    // For now, return guidelines on how to communicate
    const guidelines = content.communicationGuidelines;
    if (guidelines.length > 0) {
      const examples = guidelines[0].examples;
      // Return a culturally appropriate example
      return examples[0] || message;
    }

    return message;
  }

  /**
   * Get all supported locales
   */
  getSupportedLocales(): string[] {
    return Array.from(this.contentCache.keys());
  }

  /**
   * Export content for offline storage
   */
  exportForOfflineStorage(): Record<string, CulturalMentalHealthContent> {
    const exported: Record<string, CulturalMentalHealthContent> = {};
    this.contentCache.forEach((content, locale) => {
      exported[locale] = content;
    });
    return exported;
  }
}

// Export singleton instance
export const culturalMentalHealthService = CulturalMentalHealthService.getInstance();

// Export types
export type {
  CopingStrategy,
  CrisisApproach,
  SupportResource,
  CommunicationGuideline
};