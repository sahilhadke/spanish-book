// Curated list of common Spanish infinitives — high-frequency regulars plus
// the major irregulars. Used to pre-generate a reverse conjugation lookup
// table at build time (see generate-conjugations.mjs). Not exhaustive by
// design: this covers what a learner is likely to hit in normal reading;
// gaps can be filled by extending this list and re-running the generator.
export const VERBS = [
	// most common irregulars
	'ser', 'estar', 'ir', 'haber', 'tener', 'hacer', 'poder', 'decir', 'ver', 'dar',
	'saber', 'querer', 'llegar', 'pasar', 'deber', 'poner', 'parecer', 'quedar', 'creer', 'hablar',
	'llevar', 'dejar', 'seguir', 'encontrar', 'llamar', 'venir', 'pensar', 'salir', 'volver', 'tomar',
	'conocer', 'vivir', 'sentir', 'tratar', 'mirar', 'contar', 'empezar', 'esperar', 'buscar', 'existir',
	'entrar', 'trabajar', 'escribir', 'perder', 'producir', 'ocurrir', 'entender', 'pedir', 'recibir', 'recordar',
	'terminar', 'permitir', 'aparecer', 'conseguir', 'comenzar', 'servir', 'sacar', 'necesitar', 'mantener', 'resultar',
	'leer', 'caer', 'cambiar', 'presentar', 'crear', 'abrir', 'considerar', 'oír', 'acabar', 'convertir',
	'ganar', 'formar', 'traer', 'partir', 'morir', 'aceptar', 'realizar', 'suponer', 'comprender', 'lograr',
	'explicar', 'preguntar', 'tocar', 'reconocer', 'estudiar', 'alcanzar', 'nacer', 'dirigir', 'correr', 'utilizar',
	'pagar', 'ayudar', 'gustar', 'jugar', 'escuchar', 'cumplir', 'ofrecer', 'descubrir', 'levantar', 'intentar',
	'usar', 'apoyar', 'suceder', 'entregar', 'aparecer', 'construir', 'lograr', 'obtener', 'contener', 'atender',
	'establecer', 'representar', 'observar', 'concluir', 'comer', 'subir', 'bajar', 'cerrar', 'romper', 'faltar',
	'reunir', 'incluir', 'continuar', 'preferir', 'exigir', 'proponer', 'reflejar', 'demostrar', 'imaginar', 'olvidar',
	'nacer', 'discutir', 'informar', 'decidir', 'indicar', 'celebrar', 'iniciar', 'afirmar', 'insistir', 'confirmar',
	'dormir', 'despertar', 'vestir', 'bañar', 'lavar', 'limpiar', 'cocinar', 'comprar', 'vender', 'costar',
	'valer', 'caber', 'oler', 'huir', 'construir', 'destruir', 'traducir', 'conducir', 'reducir', 'introducir',
	'elegir', 'corregir', 'dirigir', 'exigir', 'proteger', 'coger', 'recoger', 'escoger', 'suceder', 'aprender',
	'enseñar', 'estudiar', 'preparar', 'organizar', 'planear', 'viajar', 'volar', 'nadar', 'caminar', 'correr',
	'saltar', 'bailar', 'cantar', 'pintar', 'dibujar', 'tocar', 'jugar', 'ganar', 'perder', 'competir',
	'luchar', 'pelear', 'defender', 'atacar', 'romper', 'arreglar', 'reparar', 'construir', 'destruir', 'fabricar',
	'cargar', 'descargar', 'enviar', 'recibir', 'mandar', 'llamar', 'contestar', 'responder', 'preguntar', 'contar',
	'medir', 'pesar', 'calcular', 'sumar', 'restar', 'multiplicar', 'dividir', 'resolver', 'solucionar', 'complicar',
	'simplificar', 'facilitar', 'dificultar', 'mejorar', 'empeorar', 'crecer', 'disminuir', 'aumentar', 'reducir', 'ampliar',
	'expandir', 'limitar', 'restringir', 'permitir', 'prohibir', 'autorizar', 'negar', 'aceptar', 'rechazar', 'admitir',
	'reconocer', 'ignorar', 'notar', 'advertir', 'avisar', 'anunciar', 'declarar', 'afirmar', 'negar', 'confirmar',
	'dudar', 'sospechar', 'creer', 'confiar', 'desconfiar', 'temer', 'asustar', 'preocupar', 'tranquilizar', 'calmar',
	'enojar', 'enfadar', 'molestar', 'irritar', 'alegrar', 'entristecer', 'sorprender', 'asombrar', 'admirar', 'respetar',
	'odiar', 'amar', 'querer', 'desear', 'necesitar', 'faltar', 'sobrar', 'bastar', 'convenir', 'importar'
];
