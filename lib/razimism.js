/**
 * Специальный файл для тестирования в условиях разумизма
 */
// @ts-nocheck
// @ts-ignore
import {toTelegram} from './index.js'

// @ts-expect-error: check how the runtime handles `children` missing.
const result = toTelegram(
  {
    type: 'root',
    children: [
      {
        type: 'thematicBreak',
        position: {
          start: {
            line: 1,
            column: 1,
            offset: 0
          },
          end: {
            line: 1,
            column: 4,
            offset: 3
          }
        }
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: '"4444": test\ntype: task\ncategory: media\ntags:',
            position: {
              start: {
                line: 2,
                column: 1,
                offset: 4
              },
              end: {
                line: 5,
                column: 6,
                offset: 49
              }
            }
          }
        ],
        position: {
          start: {
            line: 2,
            column: 1,
            offset: 4
          },
          end: {
            line: 5,
            column: 6,
            offset: 49
          }
        }
      },
      {
        type: 'list',
        ordered: false,
        start: null,
        spread: false,
        children: [
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value:
                      'mikevetkin\ncreation date: <% tp.file.creation_date() %>\ntomatos: "33333"\ntest: wef32efwerf\naliases:',
                    position: {
                      start: {
                        line: 6,
                        column: 5,
                        offset: 54
                      },
                      end: {
                        line: 10,
                        column: 9,
                        offset: 153
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 6,
                    column: 5,
                    offset: 54
                  },
                  end: {
                    line: 10,
                    column: 9,
                    offset: 153
                  }
                }
              }
            ],
            position: {
              start: {
                line: 6,
                column: 3,
                offset: 52
              },
              end: {
                line: 10,
                column: 9,
                offset: 153
              }
            }
          },
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: 'dddd',
                    position: {
                      start: {
                        line: 11,
                        column: 5,
                        offset: 158
                      },
                      end: {
                        line: 11,
                        column: 9,
                        offset: 162
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 11,
                    column: 5,
                    offset: 158
                  },
                  end: {
                    line: 11,
                    column: 9,
                    offset: 162
                  }
                }
              }
            ],
            position: {
              start: {
                line: 11,
                column: 3,
                offset: 156
              },
              end: {
                line: 11,
                column: 9,
                offset: 162
              }
            }
          }
        ],
        position: {
          start: {
            line: 6,
            column: 3,
            offset: 52
          },
          end: {
            line: 11,
            column: 9,
            offset: 162
          }
        }
      },
      {
        type: 'thematicBreak',
        position: {
          start: {
            line: 12,
            column: 1,
            offset: 163
          },
          end: {
            line: 12,
            column: 4,
            offset: 166
          }
        }
      },
      {
        type: 'heading',
        depth: 2,
        children: [
          {
            type: 'text',
            value: 'Идея',
            position: {
              start: {
                line: 13,
                column: 4,
                offset: 170
              },
              end: {
                line: 13,
                column: 8,
                offset: 174
              }
            }
          }
        ],
        position: {
          start: {
            line: 13,
            column: 1,
            offset: 167
          },
          end: {
            line: 13,
            column: 8,
            offset: 174
          }
        }
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value:
              'Идея пришла в голову, когда я читал блог Лёши Агапова и накидывал [[Tailwind и принципы которые за ним стоят|конспекты]].',
            position: {
              start: {
                line: 15,
                column: 1,
                offset: 176
              },
              end: {
                line: 15,
                column: 122,
                offset: 297
              }
            }
          }
        ],
        position: {
          start: {
            line: 15,
            column: 1,
            offset: 176
          },
          end: {
            line: 15,
            column: 122,
            offset: 297
          }
        }
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value:
              'Изначально я подумал, что было бы полезно сделать демку приложения, где всё делается в одном файле. Оно легковесное и простое. Но потом я придумал страшное:',
            position: {
              start: {
                line: 17,
                column: 1,
                offset: 299
              },
              end: {
                line: 17,
                column: 157,
                offset: 455
              }
            }
          }
        ],
        position: {
          start: {
            line: 17,
            column: 1,
            offset: 299
          },
          end: {
            line: 17,
            column: 157,
            offset: 455
          }
        }
      },
      {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value:
                  '[!abstract]\nЕсли принять принципы [[Locality of Behaviour|LoB]] и [[Separation Of Concerns|Soc]] осознать мысль, что их соблюдение безумно удобно для copy-paste-работы с [[ChatGPT]]. То так же легко принять идею, что лендинги, да и в принципе фронтенд приложения могут быть очень быстро написаны chatGPT. Как их дорабатывать. Да просто показывать файл, который нужно доработать и просить это сделать. Слишком наговнокодил? Просто попроси GPT причесать код.',
                position: {
                  start: {
                    line: 19,
                    column: 2,
                    offset: 458
                  },
                  end: {
                    line: 20,
                    column: 446,
                    offset: 915
                  }
                }
              }
            ],
            position: {
              start: {
                line: 19,
                column: 2,
                offset: 458
              },
              end: {
                line: 20,
                column: 446,
                offset: 915
              }
            }
          }
        ],
        position: {
          start: {
            line: 19,
            column: 1,
            offset: 457
          },
          end: {
            line: 20,
            column: 446,
            offset: 915
          }
        }
      },
      {
        type: 'heading',
        depth: 2,
        children: [
          {
            type: 'text',
            value: 'Материалы',
            position: {
              start: {
                line: 21,
                column: 4,
                offset: 919
              },
              end: {
                line: 21,
                column: 13,
                offset: 928
              }
            }
          }
        ],
        position: {
          start: {
            line: 21,
            column: 1,
            offset: 916
          },
          end: {
            line: 21,
            column: 13,
            offset: 928
          }
        }
      },
      {
        type: 'list',
        ordered: false,
        start: null,
        spread: false,
        children: [
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: '[x] [[Tailwind и принципы которые за ним стоят]]',
                    position: {
                      start: {
                        line: 22,
                        column: 3,
                        offset: 931
                      },
                      end: {
                        line: 22,
                        column: 51,
                        offset: 979
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 22,
                    column: 3,
                    offset: 931
                  },
                  end: {
                    line: 22,
                    column: 51,
                    offset: 979
                  }
                }
              }
            ],
            position: {
              start: {
                line: 22,
                column: 1,
                offset: 929
              },
              end: {
                line: 22,
                column: 51,
                offset: 979
              }
            }
          },
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: '[x] [[Компоненту больше не нужны папки]]',
                    position: {
                      start: {
                        line: 23,
                        column: 3,
                        offset: 982
                      },
                      end: {
                        line: 23,
                        column: 43,
                        offset: 1022
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 23,
                    column: 3,
                    offset: 982
                  },
                  end: {
                    line: 23,
                    column: 43,
                    offset: 1022
                  }
                }
              }
            ],
            position: {
              start: {
                line: 23,
                column: 1,
                offset: 980
              },
              end: {
                line: 23,
                column: 43,
                offset: 1022
              }
            }
          },
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: '[x] [[LoB и DoC код выгоден при AI генерации]]',
                    position: {
                      start: {
                        line: 24,
                        column: 3,
                        offset: 1025
                      },
                      end: {
                        line: 24,
                        column: 49,
                        offset: 1071
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 24,
                    column: 3,
                    offset: 1025
                  },
                  end: {
                    line: 24,
                    column: 49,
                    offset: 1071
                  }
                }
              }
            ],
            position: {
              start: {
                line: 24,
                column: 1,
                offset: 1023
              },
              end: {
                line: 24,
                column: 49,
                offset: 1071
              }
            }
          },
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value:
                      '[ ] [[Лэндинг с примером работы на ShadCN UI|Лендинг Garnet',
                    position: {
                      start: {
                        line: 25,
                        column: 3,
                        offset: 1074
                      },
                      end: {
                        line: 25,
                        column: 62,
                        offset: 1133
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 25,
                    column: 3,
                    offset: 1074
                  },
                  end: {
                    line: 25,
                    column: 62,
                    offset: 1133
                  }
                }
              }
            ],
            position: {
              start: {
                line: 25,
                column: 1,
                offset: 1072
              },
              end: {
                line: 25,
                column: 62,
                offset: 1133
              }
            }
          },
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: '[ ] [[AI многоработье]]',
                    position: {
                      start: {
                        line: 26,
                        column: 3,
                        offset: 1136
                      },
                      end: {
                        line: 26,
                        column: 26,
                        offset: 1159
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 26,
                    column: 3,
                    offset: 1136
                  },
                  end: {
                    line: 26,
                    column: 26,
                    offset: 1159
                  }
                }
              }
            ],
            position: {
              start: {
                line: 26,
                column: 1,
                offset: 1134
              },
              end: {
                line: 26,
                column: 26,
                offset: 1159
              }
            }
          },
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value:
                      '[ ] [[Увеличивая автоматизацию мы увольняем людей]]',
                    position: {
                      start: {
                        line: 27,
                        column: 3,
                        offset: 1162
                      },
                      end: {
                        line: 27,
                        column: 54,
                        offset: 1213
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 27,
                    column: 3,
                    offset: 1162
                  },
                  end: {
                    line: 27,
                    column: 54,
                    offset: 1213
                  }
                }
              }
            ],
            position: {
              start: {
                line: 27,
                column: 1,
                offset: 1160
              },
              end: {
                line: 27,
                column: 54,
                offset: 1213
              }
            }
          }
        ],
        position: {
          start: {
            line: 22,
            column: 1,
            offset: 929
          },
          end: {
            line: 27,
            column: 54,
            offset: 1213
          }
        }
      },
      {
        type: 'heading',
        depth: 2,
        children: [
          {
            type: 'text',
            value: 'Структура',
            position: {
              start: {
                line: 28,
                column: 4,
                offset: 1217
              },
              end: {
                line: 28,
                column: 13,
                offset: 1226
              }
            }
          }
        ],
        position: {
          start: {
            line: 28,
            column: 1,
            offset: 1214
          },
          end: {
            line: 28,
            column: 13,
            offset: 1226
          }
        }
      },
      {
        type: 'list',
        ordered: false,
        start: null,
        spread: false,
        children: [
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: 'Принципы стоящие за статьёй',
                    position: {
                      start: {
                        line: 29,
                        column: 3,
                        offset: 1229
                      },
                      end: {
                        line: 29,
                        column: 30,
                        offset: 1256
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 29,
                    column: 3,
                    offset: 1229
                  },
                  end: {
                    line: 29,
                    column: 30,
                    offset: 1256
                  }
                }
              },
              {
                type: 'list',
                ordered: false,
                start: null,
                spread: false,
                children: [
                  {
                    type: 'listItem',
                    spread: false,
                    checked: null,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            value: '[[Locality of Behaviour]]',
                            position: {
                              start: {
                                line: 30,
                                column: 4,
                                offset: 1260
                              },
                              end: {
                                line: 30,
                                column: 29,
                                offset: 1285
                              }
                            }
                          }
                        ],
                        position: {
                          start: {
                            line: 30,
                            column: 4,
                            offset: 1260
                          },
                          end: {
                            line: 30,
                            column: 29,
                            offset: 1285
                          }
                        }
                      }
                    ],
                    position: {
                      start: {
                        line: 30,
                        column: 2,
                        offset: 1258
                      },
                      end: {
                        line: 30,
                        column: 29,
                        offset: 1285
                      }
                    }
                  },
                  {
                    type: 'listItem',
                    spread: false,
                    checked: null,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            value: '[[Deleteability of code]]',
                            position: {
                              start: {
                                line: 31,
                                column: 4,
                                offset: 1289
                              },
                              end: {
                                line: 31,
                                column: 29,
                                offset: 1314
                              }
                            }
                          }
                        ],
                        position: {
                          start: {
                            line: 31,
                            column: 4,
                            offset: 1289
                          },
                          end: {
                            line: 31,
                            column: 29,
                            offset: 1314
                          }
                        }
                      }
                    ],
                    position: {
                      start: {
                        line: 31,
                        column: 2,
                        offset: 1287
                      },
                      end: {
                        line: 31,
                        column: 29,
                        offset: 1314
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 30,
                    column: 2,
                    offset: 1258
                  },
                  end: {
                    line: 31,
                    column: 29,
                    offset: 1314
                  }
                }
              }
            ],
            position: {
              start: {
                line: 29,
                column: 1,
                offset: 1227
              },
              end: {
                line: 31,
                column: 29,
                offset: 1314
              }
            }
          },
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: 'Идеальный стек для AI',
                    position: {
                      start: {
                        line: 32,
                        column: 3,
                        offset: 1317
                      },
                      end: {
                        line: 32,
                        column: 24,
                        offset: 1338
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 32,
                    column: 3,
                    offset: 1317
                  },
                  end: {
                    line: 32,
                    column: 24,
                    offset: 1338
                  }
                }
              },
              {
                type: 'list',
                ordered: false,
                start: null,
                spread: false,
                children: [
                  {
                    type: 'listItem',
                    spread: false,
                    checked: null,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            value: '[[Tailwind]]',
                            position: {
                              start: {
                                line: 33,
                                column: 4,
                                offset: 1342
                              },
                              end: {
                                line: 33,
                                column: 16,
                                offset: 1354
                              }
                            }
                          }
                        ],
                        position: {
                          start: {
                            line: 33,
                            column: 4,
                            offset: 1342
                          },
                          end: {
                            line: 33,
                            column: 16,
                            offset: 1354
                          }
                        }
                      }
                    ],
                    position: {
                      start: {
                        line: 33,
                        column: 2,
                        offset: 1340
                      },
                      end: {
                        line: 33,
                        column: 16,
                        offset: 1354
                      }
                    }
                  },
                  {
                    type: 'listItem',
                    spread: false,
                    checked: null,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            value: '[[htmx]]',
                            position: {
                              start: {
                                line: 34,
                                column: 4,
                                offset: 1358
                              },
                              end: {
                                line: 34,
                                column: 12,
                                offset: 1366
                              }
                            }
                          }
                        ],
                        position: {
                          start: {
                            line: 34,
                            column: 4,
                            offset: 1358
                          },
                          end: {
                            line: 34,
                            column: 12,
                            offset: 1366
                          }
                        }
                      }
                    ],
                    position: {
                      start: {
                        line: 34,
                        column: 2,
                        offset: 1356
                      },
                      end: {
                        line: 34,
                        column: 12,
                        offset: 1366
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 33,
                    column: 2,
                    offset: 1340
                  },
                  end: {
                    line: 34,
                    column: 12,
                    offset: 1366
                  }
                }
              }
            ],
            position: {
              start: {
                line: 32,
                column: 1,
                offset: 1315
              },
              end: {
                line: 34,
                column: 12,
                offset: 1366
              }
            }
          },
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value:
                      'Реализация [[Лэндинг с примером работы на ShadCN UI|лендинга Garnet]]',
                    position: {
                      start: {
                        line: 35,
                        column: 3,
                        offset: 1369
                      },
                      end: {
                        line: 35,
                        column: 72,
                        offset: 1438
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 35,
                    column: 3,
                    offset: 1369
                  },
                  end: {
                    line: 35,
                    column: 72,
                    offset: 1438
                  }
                }
              }
            ],
            position: {
              start: {
                line: 35,
                column: 1,
                offset: 1367
              },
              end: {
                line: 35,
                column: 72,
                offset: 1438
              }
            }
          },
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: 'Выводы',
                    position: {
                      start: {
                        line: 36,
                        column: 3,
                        offset: 1441
                      },
                      end: {
                        line: 36,
                        column: 9,
                        offset: 1447
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 36,
                    column: 3,
                    offset: 1441
                  },
                  end: {
                    line: 36,
                    column: 9,
                    offset: 1447
                  }
                }
              },
              {
                type: 'list',
                ordered: false,
                start: null,
                spread: false,
                children: [
                  {
                    type: 'listItem',
                    spread: false,
                    checked: null,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            value:
                              '[[Увеличивая автоматизацию мы увольняем людей]]',
                            position: {
                              start: {
                                line: 37,
                                column: 4,
                                offset: 1451
                              },
                              end: {
                                line: 37,
                                column: 51,
                                offset: 1498
                              }
                            }
                          }
                        ],
                        position: {
                          start: {
                            line: 37,
                            column: 4,
                            offset: 1451
                          },
                          end: {
                            line: 37,
                            column: 51,
                            offset: 1498
                          }
                        }
                      }
                    ],
                    position: {
                      start: {
                        line: 37,
                        column: 2,
                        offset: 1449
                      },
                      end: {
                        line: 37,
                        column: 51,
                        offset: 1498
                      }
                    }
                  },
                  {
                    type: 'listItem',
                    spread: false,
                    checked: null,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            value: '[[Инженерия - это не код]]',
                            position: {
                              start: {
                                line: 38,
                                column: 4,
                                offset: 1502
                              },
                              end: {
                                line: 38,
                                column: 30,
                                offset: 1528
                              }
                            }
                          }
                        ],
                        position: {
                          start: {
                            line: 38,
                            column: 4,
                            offset: 1502
                          },
                          end: {
                            line: 38,
                            column: 30,
                            offset: 1528
                          }
                        }
                      }
                    ],
                    position: {
                      start: {
                        line: 38,
                        column: 2,
                        offset: 1500
                      },
                      end: {
                        line: 38,
                        column: 30,
                        offset: 1528
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 37,
                    column: 2,
                    offset: 1449
                  },
                  end: {
                    line: 38,
                    column: 30,
                    offset: 1528
                  }
                }
              }
            ],
            position: {
              start: {
                line: 36,
                column: 1,
                offset: 1439
              },
              end: {
                line: 38,
                column: 30,
                offset: 1528
              }
            }
          }
        ],
        position: {
          start: {
            line: 29,
            column: 1,
            offset: 1227
          },
          end: {
            line: 38,
            column: 30,
            offset: 1528
          }
        }
      },
      {
        type: 'heading',
        depth: 2,
        children: [
          {
            type: 'text',
            value: 'Текст',
            position: {
              start: {
                line: 40,
                column: 4,
                offset: 1533
              },
              end: {
                line: 40,
                column: 9,
                offset: 1538
              }
            }
          }
        ],
        position: {
          start: {
            line: 40,
            column: 1,
            offset: 1530
          },
          end: {
            line: 40,
            column: 9,
            offset: 1538
          }
        }
      },
      {
        type: 'list',
        ordered: false,
        start: null,
        spread: false,
        children: [
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: '[ ] [[Текст для статьи]]',
                    position: {
                      start: {
                        line: 41,
                        column: 3,
                        offset: 1541
                      },
                      end: {
                        line: 41,
                        column: 27,
                        offset: 1565
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 41,
                    column: 3,
                    offset: 1541
                  },
                  end: {
                    line: 41,
                    column: 27,
                    offset: 1565
                  }
                }
              }
            ],
            position: {
              start: {
                line: 41,
                column: 1,
                offset: 1539
              },
              end: {
                line: 41,
                column: 27,
                offset: 1565
              }
            }
          }
        ],
        position: {
          start: {
            line: 41,
            column: 1,
            offset: 1539
          },
          end: {
            line: 41,
            column: 27,
            offset: 1565
          }
        }
      },
      {
        type: 'heading',
        depth: 2,
        children: [
          {
            type: 'text',
            value: 'Медиафайлы',
            position: {
              start: {
                line: 43,
                column: 4,
                offset: 1570
              },
              end: {
                line: 43,
                column: 14,
                offset: 1580
              }
            }
          }
        ],
        position: {
          start: {
            line: 43,
            column: 1,
            offset: 1567
          },
          end: {
            line: 43,
            column: 14,
            offset: 1580
          }
        }
      },
      {
        type: 'list',
        ordered: false,
        start: null,
        spread: false,
        children: [
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: '[ ] ',
                    position: {
                      start: {
                        line: 44,
                        column: 3,
                        offset: 1583
                      },
                      end: {
                        line: 44,
                        column: 7,
                        offset: 1587
                      }
                    }
                  },
                  {
                    type: 'link',
                    title: null,
                    url: 'https://www.figma.com/design/kn0swDD8lvANorEgI5t6py/mikevetkin?node-id=0-1&t=wZd6nF2d55mEOWmJ-1',
                    children: [
                      {
                        type: 'text',
                        value: 'Обложка',
                        position: {
                          start: {
                            line: 44,
                            column: 8,
                            offset: 1588
                          },
                          end: {
                            line: 44,
                            column: 15,
                            offset: 1595
                          }
                        }
                      }
                    ],
                    position: {
                      start: {
                        line: 44,
                        column: 7,
                        offset: 1587
                      },
                      end: {
                        line: 44,
                        column: 113,
                        offset: 1693
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 44,
                    column: 3,
                    offset: 1583
                  },
                  end: {
                    line: 44,
                    column: 113,
                    offset: 1693
                  }
                }
              }
            ],
            position: {
              start: {
                line: 44,
                column: 1,
                offset: 1581
              },
              end: {
                line: 44,
                column: 113,
                offset: 1693
              }
            }
          }
        ],
        position: {
          start: {
            line: 44,
            column: 1,
            offset: 1581
          },
          end: {
            line: 44,
            column: 113,
            offset: 1693
          }
        }
      },
      {
        type: 'heading',
        depth: 2,
        children: [
          {
            type: 'text',
            value: 'Публикация',
            position: {
              start: {
                line: 46,
                column: 4,
                offset: 1698
              },
              end: {
                line: 46,
                column: 14,
                offset: 1708
              }
            }
          }
        ],
        position: {
          start: {
            line: 46,
            column: 1,
            offset: 1695
          },
          end: {
            line: 46,
            column: 14,
            offset: 1708
          }
        }
      },
      {
        type: 'list',
        ordered: false,
        start: null,
        spread: false,
        children: [
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: '[ ] [[mikevetkin.com]]',
                    position: {
                      start: {
                        line: 47,
                        column: 3,
                        offset: 1711
                      },
                      end: {
                        line: 47,
                        column: 25,
                        offset: 1733
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 47,
                    column: 3,
                    offset: 1711
                  },
                  end: {
                    line: 47,
                    column: 25,
                    offset: 1733
                  }
                }
              }
            ],
            position: {
              start: {
                line: 47,
                column: 1,
                offset: 1709
              },
              end: {
                line: 47,
                column: 25,
                offset: 1733
              }
            }
          },
          {
            type: 'listItem',
            spread: false,
            checked: null,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: '[ ] telegram канал',
                    position: {
                      start: {
                        line: 48,
                        column: 3,
                        offset: 1736
                      },
                      end: {
                        line: 48,
                        column: 21,
                        offset: 1754
                      }
                    }
                  }
                ],
                position: {
                  start: {
                    line: 48,
                    column: 3,
                    offset: 1736
                  },
                  end: {
                    line: 48,
                    column: 21,
                    offset: 1754
                  }
                }
              }
            ],
            position: {
              start: {
                line: 48,
                column: 1,
                offset: 1734
              },
              end: {
                line: 48,
                column: 21,
                offset: 1754
              }
            }
          }
        ],
        position: {
          start: {
            line: 47,
            column: 1,
            offset: 1709
          },
          end: {
            line: 48,
            column: 21,
            offset: 1754
          }
        }
      },
      {
        type: 'heading',
        depth: 2,
        children: [
          {
            type: 'text',
            value: 'Проработка',
            position: {
              start: {
                line: 50,
                column: 4,
                offset: 1759
              },
              end: {
                line: 50,
                column: 14,
                offset: 1769
              }
            }
          }
        ],
        position: {
          start: {
            line: 50,
            column: 1,
            offset: 1756
          },
          end: {
            line: 50,
            column: 14,
            offset: 1769
          }
        }
      }
    ],
    position: {
      start: {
        line: 1,
        column: 1,
        offset: 0
      },
      end: {
        line: 52,
        column: 1,
        offset: 1771
      }
    }
  },
  {filename: 'test'}
)

console.log('otvet :>>', result)
